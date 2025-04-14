
import { Answer, AssessmentResult } from '../types/assessment';
import { supabase } from './supabase';
import { analyzeAnswers, analyzeText, detectEmergency, generateEmergencyResponse, NLPAnalysis } from './nlp';

const PHQ9_WEIGHTS = {
  minimal: { min: 0, max: 4 },
  mild: { min: 5, max: 9 },
  moderate: { min: 10, max: 14 },
  moderatelySevere: { min: 15, max: 19 },
  severe: { min: 20, max: 27 },
};

const GAD7_WEIGHTS = {
  minimal: { min: 0, max: 4 },
  mild: { min: 5, max: 9 },
  moderate: { min: 10, max: 14 },
  severe: { min: 15, max: 21 },
};

export async function submitAssessment(answers: Answer[]): Promise<AssessmentResult> {
  try {
    // Analyze numerical scores
    const scores = calculateScores(answers);
    
    // Analyze text responses
    const textAnalysis = await Promise.all(
      answers
        .filter(a => typeof a.value === 'string')
        .map(a => analyzeText(a.value as string))
    );
    
    // Combine analyses for final diagnosis
    const diagnosis = analyzeDiagnosis(scores, textAnalysis);
    
    // Check for emergency situations
    const isEmergency = textAnalysis.some(analysis => detectEmergency(analysis));
    
    const result: AssessmentResult = {
      userId: (await supabase.auth.getUser()).data.user?.id || '',
      scores,
      primaryCondition: diagnosis.primary,
      secondaryConditions: diagnosis.secondary,
      severity: diagnosis.severity,
      riskLevel: isEmergency ? 'emergency' : getRiskLevel(diagnosis.severity),
      timestamp: new Date(),
      recommendations: generateRecommendations(diagnosis, isEmergency),
    };

    const { error } = await supabase
      .from('assessments')
      .insert([{
        user_id: result.userId,
        answers: answers,
        scores: result.scores,
        primary_condition: result.primaryCondition,
        secondary_conditions: result.secondaryConditions,
        severity: result.severity,
        recommendations: result.recommendations,
      }]);

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error submitting assessment:', error);
    throw error;
  }
}

// Helper function to determine risk level based on severity
function getRiskLevel(severity: 'minimal' | 'mild' | 'moderate' | 'severe'): 'low' | 'medium' | 'high' {
  switch (severity) {
    case 'minimal':
    case 'mild':
      return 'low';
    case 'moderate':
      return 'medium';
    case 'severe':
      return 'high';
    default:
      return 'medium';
  }
}

function calculateScores(answers: Answer[]): Record<string, number> {
  // Get ML-based scores
  const mlScores = analyzeAnswers(answers);
  
  // Calculate PHQ-9 and GAD-7 scores
  const phq9Score = answers
    .filter(a => a.questionId.startsWith('phq9_'))
    .reduce((sum, a) => sum + (typeof a.value === 'number' ? a.value : 0), 0);
    
  const gad7Score = answers
    .filter(a => a.questionId.startsWith('gad7_'))
    .reduce((sum, a) => sum + (typeof a.value === 'number' ? a.value : 0), 0);

  return {
    ...mlScores,
    phq9: phq9Score,
    gad7: gad7Score,
  };
}

function analyzeDiagnosis(
  scores: Record<string, number>,
  textAnalyses: NLPAnalysis[]
) {
  // Determine severity based on PHQ-9 and GAD-7 scores
  let severity: 'mild' | 'moderate' | 'severe' = 'moderate';
  if (scores.phq9 >= PHQ9_WEIGHTS.severe.min || scores.gad7 >= GAD7_WEIGHTS.severe.min) {
    severity = 'severe';
  } else if (scores.phq9 <= PHQ9_WEIGHTS.mild.max && scores.gad7 <= GAD7_WEIGHTS.mild.max) {
    severity = 'mild';
  }

  // Combine ML scores and standardized test scores for final diagnosis
  const conditions = Object.entries({
    depression: scores.depression * 0.7 + (scores.phq9 / PHQ9_WEIGHTS.severe.max) * 0.3,
    anxiety: scores.anxiety * 0.7 + (scores.gad7 / GAD7_WEIGHTS.severe.max) * 0.3,
    ptsd: scores.ptsd,
  }).sort((a, b) => b[1] - a[1]);

  // Add emotional analysis from text responses
  const emotionalScores = textAnalyses.reduce((acc, analysis) => {
    Object.entries(analysis.emotions).forEach(([condition, score]) => {
      acc[condition] = (acc[condition] || 0) + score;
    });
    return acc;
  }, {} as Record<string, number>);

  return {
    primary: conditions[0][0],
    secondary: conditions.slice(1).map(c => c[0]),
    severity,
    emotionalScores,
  };
}

function generateRecommendations(
  diagnosis: { primary: string; severity: string; emotionalScores: Record<string, number> },
  isEmergency: boolean
): string[] {
  if (isEmergency) {
    return [generateEmergencyResponse()];
  }

  const recommendations = [
    'Schedule an appointment with a mental health professional for a thorough evaluation',
  ];

  // Add condition-specific recommendations
  switch (diagnosis.primary) {
    case 'depression':
      recommendations.push(
        'Begin a daily exercise routine, even if just for 15 minutes',
        'Practice mindfulness meditation to improve mood',
        'Maintain a regular sleep schedule',
        'Connect with friends or family members daily'
      );
      break;
    case 'anxiety':
      recommendations.push(
        'Learn and practice deep breathing exercises',
        'Try progressive muscle relaxation techniques',
        'Limit caffeine and alcohol intake',
        'Keep a worry journal to track triggers'
      );
      break;
    case 'ptsd':
      recommendations.push(
        'Consider trauma-focused cognitive behavioral therapy',
        'Practice grounding techniques',
        'Join a support group for trauma survivors',
        'Create a safety plan for triggering situations'
      );
      break;
  }

  // Add severity-specific recommendations
  if (diagnosis.severity === 'severe') {
    recommendations.unshift(
      'Consider scheduling an urgent appointment with a psychiatrist',
      'Discuss medication options with your healthcare provider'
    );
  }

  return recommendations;
}
