import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react';
import { Question, Answer, AssessmentResult } from '../types/assessment';
import { primaryQuestions, secondaryQuestions, openEndedQuestions } from '../lib/questions';
import { submitAssessment } from '../lib/assessment';

interface QuestionnaireProps {
  onComplete: (results: AssessmentResult) => void;
}

function Questionnaire({ onComplete }: QuestionnaireProps) {
  const [currentTier, setCurrentTier] = useState<'primary' | 'secondary'>('primary');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [startTime, setStartTime] = useState<Record<string, number>>({});

  // Initialize active questions with primary questions
  useEffect(() => {
    setActiveQuestions([...primaryQuestions, ...openEndedQuestions]);
  }, []);

  // Handle answer selection
  const handleAnswer = (question: Question, value: string | number) => {
    const now = Date.now();
    const responseTime = startTime[question.id] ? now - startTime[question.id] : 0;

    const newAnswer: Answer = {
      questionId: question.id,
      value,
      timestamp: new Date(),
      metadata: {
        responseTime,
        skipped: false,
        revised: answers.some(a => a.questionId === question.id),
      },
    };

    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== question.id);
      return [...filtered, newAnswer];
    });

    // Check for follow-up triggers
    if (question.followUpTrigger && currentTier === 'primary') {
      const { condition, value: triggerValue, threshold } = question.followUpTrigger;
      const shouldTrigger = condition === 'value' && 
        (typeof value === 'number' ? value >= Number(threshold) : value === triggerValue);

      if (shouldTrigger) {
        const categoryQuestions = secondaryQuestions.filter(q => q.category === question.category);
        setActiveQuestions(prev => [...prev, ...categoryQuestions]);
      }
    }
  };

  // Handle question skipping
  const handleSkip = (question: Question) => {
    const now = Date.now();
    const responseTime = startTime[question.id] ? now - startTime[question.id] : 0;

    const newAnswer: Answer = {
      questionId: question.id,
      value: '',
      timestamp: new Date(),
      metadata: {
        responseTime,
        skipped: true,
        revised: false,
      },
    };

    setAnswers(prev => [...prev, newAnswer]);
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setStartTime(prev => ({ ...prev, [activeQuestions[currentIndex + 1].id]: Date.now() }));
    } else if (currentTier === 'primary' && answers.some(a => a.questionId.startsWith('phq2_') || a.questionId.startsWith('gad2_'))) {
      setCurrentTier('secondary');
      setCurrentIndex(0);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setStartTime(prev => ({ ...prev, [activeQuestions[currentIndex - 1].id]: Date.now() }));
    }
  };

  const handleComplete = async () => {
    try {
      const result = await submitAssessment(answers);
      onComplete(result);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      // Handle error appropriately
    }
  };

  const currentQuestion = activeQuestions[currentIndex];
  const progress = (currentIndex + 1) / activeQuestions.length;

  // Set start time for first question
  useEffect(() => {
    if (currentQuestion && !startTime[currentQuestion.id]) {
      setStartTime(prev => ({ ...prev, [currentQuestion.id]: Date.now() }));
    }
  }, [currentQuestion]);

  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Mental Health Assessment</h2>
      
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Progress</span>
          <span className="text-sm text-gray-600">{currentIndex + 1} of {activeQuestions.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${progress * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border">
        {currentQuestion.tier === 'secondary' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" size={20} />
            <p className="text-sm text-yellow-700">Based on your responses, we'd like to ask you a few more detailed questions.</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-gray-700">{currentQuestion.text}</p>
            {currentQuestion.type === 'text' ? (
              <textarea
                value={(answers.find(a => a.questionId === currentQuestion.id)?.value as string) || ''}
                onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
                className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Type your response here..."
              />
            ) : currentQuestion.type === 'scale' ? (
              <div className="grid grid-cols-5 gap-2">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(currentQuestion, Number(option))}
                    className={`p-3 rounded-lg border transition-colors ${
                      answers.find(a => a.questionId === currentQuestion.id)?.value === Number(option)
                        ? 'bg-purple-100 border-purple-300 text-purple-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(currentQuestion, option)}
                    className={`p-3 rounded-lg border transition-colors ${
                      answers.find(a => a.questionId === currentQuestion.id)?.value === option
                        ? 'bg-purple-100 border-purple-300 text-purple-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            <ChevronLeft size={20} />
            <span>Previous</span>
          </button>
          
          <div className="flex gap-3">
            {currentQuestion.type !== 'text' && (
              <button
                onClick={() => handleSkip(currentQuestion)}
                className="text-gray-500 hover:text-gray-700"
              >
                Skip
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center text-purple-600 hover:text-purple-700"
            >
              <span>{currentIndex === activeQuestions.length - 1 ? 'Complete' : 'Next'}</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Questionnaire;