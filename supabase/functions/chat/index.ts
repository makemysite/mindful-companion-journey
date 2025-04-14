import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { Configuration, OpenAIApi } from 'npm:openai@4.28.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  userId: string;
  context?: {
    diagnosis?: string;
    severity?: string;
    previousRecommendations?: string[];
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId, context } = await req.json() as ChatRequest;

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);

    // Build system message based on context
    let systemMessage = `You are an empathetic and knowledgeable AI mental health assistant. 
Your role is to provide support, guidance, and evidence-based recommendations while maintaining appropriate boundaries.
Always remind users that you are an AI and encourage professional help when needed.`;

    if (context?.diagnosis) {
      systemMessage += `\nThe user has been diagnosed with ${context.diagnosis} (${context.severity} severity).`;
      if (context.previousRecommendations?.length) {
        systemMessage += `\nPrevious recommendations: ${context.previousRecommendations.join(', ')}`;
      }
    }

    // Prepare messages for OpenAI
    const conversationMessages = [
      { role: 'system', content: systemMessage },
      ...messages,
    ];

    // Get response from OpenAI
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: conversationMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.data.choices[0].message;

    // Store the conversation in Supabase
    await supabaseClient.from('chat_sessions').insert({
      user_id: userId,
      messages: [...messages, response],
    });

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});