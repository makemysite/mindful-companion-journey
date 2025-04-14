import nlp from 'compromise';
import Sentiment from 'sentiment';
import * as tf from '@tensorflow/tfjs';
import { Answer } from '../types/assessment';

const sentiment = new Sentiment();

// Emotional keywords for different conditions
const emotionalPatterns = {
  depression: ['sad', 'hopeless', 'worthless', 'tired', 'empty', 'lonely'],
  anxiety: ['worried', 'nervous', 'panic', 'fear', 'stress', 'tense'],
  ptsd: ['flashback', 'nightmare', 'trauma', 'avoid', 'startle', 'trigger'],
  bipolar: ['manic', 'energy', 'racing', 'impulsive', 'high', 'low'],
};

export interface NLPAnalysis {
  sentiment: number;
  emotions: Record<string, number>;
  urgency: number;
  topics: string[];
}

export async function analyzeText(text: string): Promise<NLPAnalysis> {
  // Perform sentiment analysis
  const sentimentScore = sentiment.analyze(text);
  
  // Process text with compromise
  const doc = nlp(text);
  
  // Extract emotional patterns
  const emotions: Record<string, number> = {};
  Object.entries(emotionalPatterns).forEach(([condition, patterns]) => {
    const matches = patterns.filter(pattern => doc.has(pattern));
    emotions[condition] = matches.length / patterns.length;
  });

  // Determine urgency based on specific keywords and patterns
  const urgencyKeywords = ['immediately', 'emergency', 'crisis', 'suicide', 'harm'];
  const urgencyScore = urgencyKeywords.filter(keyword => doc.has(keyword)).length / urgencyKeywords.length;

  // Extract main topics
  const topics = doc.topics().json().map((t: any) => t.text);

  return {
    sentiment: sentimentScore.comparative,
    emotions,
    urgency: urgencyScore,
    topics,
  };
}

export function analyzeAnswers(answers: Answer[]): Record<string, number> {
  // Convert answers to tensor
  const answerValues = answers.map(a => typeof a.value === 'number' ? a.value : 0);
  const inputTensor = tf.tensor2d([answerValues]);

  // Simple neural network for scoring
  // In a production environment, this would be a pre-trained model
  const model = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [answers.length], units: 16, activation: 'relu' }),
      tf.layers.dense({ units: 8, activation: 'relu' }),
      tf.layers.dense({ units: 4, activation: 'sigmoid' })
    ]
  });

  // Make prediction
  const prediction = model.predict(inputTensor) as tf.Tensor;
  const scores = prediction.dataSync();

  // Map scores to conditions
  return {
    depression: scores[0],
    anxiety: scores[1],
    ptsd: scores[2],
    general: scores[3],
  };
}

export function detectEmergency(analysis: NLPAnalysis): boolean {
  const emergencyThreshold = 0.7;
  return (
    analysis.urgency > emergencyThreshold ||
    analysis.sentiment < -0.8 ||
    analysis.topics.some(topic => 
      ['suicide', 'self-harm', 'emergency', 'crisis'].includes(topic.toLowerCase())
    )
  );
}

export function generateEmergencyResponse(): string {
  return `
    I notice you're expressing thoughts that concern me. Your safety is the top priority.
    Please immediately contact one of these emergency resources:

    - National Crisis Hotline (24/7): 988
    - Emergency Services: 911
    - Crisis Text Line: Text HOME to 741741

    These professionals are ready to help you right now. You don't have to go through this alone.
  `.trim();
}