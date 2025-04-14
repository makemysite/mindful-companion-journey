
import { z } from 'zod';

export const QuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.enum(['scale', 'choice', 'text']),
  options: z.array(z.string()).optional(),
  category: z.enum(['mood', 'anxiety', 'cognitive', 'stress', 'sleep', 'substance']),
  tier: z.enum(['primary', 'secondary']),
  weight: z.number(),
  followUpTrigger: z.object({
    condition: z.string(),
    value: z.union([z.string(), z.number()]),
    threshold: z.union([z.string(), z.number()]),
  }).optional(),
  validationRules: z.array(z.object({
    type: z.enum(['required', 'min', 'max', 'pattern']),
    value: z.union([z.string(), z.number()]).optional(),
    message: z.string(),
  })).optional(),
});

export const AnswerSchema = z.object({
  questionId: z.string(),
  value: z.union([z.string(), z.number()]),
  timestamp: z.date(),
  metadata: z.object({
    responseTime: z.number(),
    skipped: z.boolean(),
    revised: z.boolean(),
  }),
});

export const NLPAnalysisSchema = z.object({
  sentiment: z.number(),
  emotions: z.record(z.string(), z.number()),
  urgency: z.number(),
  topics: z.array(z.string()),
});

export const AssessmentResultSchema = z.object({
  userId: z.string(),
  scores: z.record(z.string(), z.number()),
  primaryCondition: z.string(),
  secondaryConditions: z.array(z.string()),
  severity: z.enum(['minimal', 'mild', 'moderate', 'moderatelySevere', 'severe']),
  riskLevel: z.enum(['low', 'medium', 'high', 'emergency']),
  timestamp: z.date(),
  recommendations: z.array(z.string()),
  nlpAnalysis: z.object({
    emotions: z.record(z.string(), z.number()),
    sentiments: z.record(z.string(), z.number()),
    topics: z.array(z.string()),
    emergencyFlags: z.array(z.string()),
  }).optional(),
  metadata: z.object({
    completionTime: z.number(),
    questionCount: z.number(),
    skippedCount: z.number(),
    revisedCount: z.number(),
    tier2Triggered: z.boolean(),
  }).optional(),
});

export type Question = z.infer<typeof QuestionSchema>;
export type Answer = z.infer<typeof AnswerSchema>;
export type NLPAnalysis = z.infer<typeof NLPAnalysisSchema>;
export type AssessmentResult = z.infer<typeof AssessmentResultSchema>;
