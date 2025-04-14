import React from 'react';
import { Calendar, Brain, HeartPulse, Footprints } from 'lucide-react';

interface TreatmentProps {
  diagnosis: any;
}

function Treatment({ diagnosis }: TreatmentProps) {
  if (!diagnosis) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please complete the assessment first to receive your personalized treatment plan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Personalized Treatment Plan</h2>
        <p className="text-gray-600">
          Based on your assessment, we've created a comprehensive treatment plan to help support your mental well-being.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-medium">Recommended Activities</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2"></div>
              <span>Daily mindfulness meditation (10-15 minutes)</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2"></div>
              <span>Progressive muscle relaxation before bed</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2"></div>
              <span>Journaling thoughts and feelings</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <HeartPulse className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-medium">Lifestyle Recommendations</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
              <span>Maintain a regular sleep schedule</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
              <span>30 minutes of daily physical activity</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
              <span>Limit caffeine and alcohol intake</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-purple-50 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Calendar className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-medium">Weekly Goals</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <h4 className="font-medium mb-2">Mindfulness</h4>
            <p className="text-sm text-gray-600">Practice mindfulness exercises 3-4 times this week</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <h4 className="font-medium mb-2">Physical Activity</h4>
            <p className="text-sm text-gray-600">Complete 150 minutes of moderate exercise</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <h4 className="font-medium mb-2">Social Connection</h4>
            <p className="text-sm text-gray-600">Reach out to one friend or family member</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Footprints className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-medium">Next Steps</h3>
        </div>
        <p className="text-gray-600 mb-4">
          While this AI-generated plan can be helpful, we strongly recommend:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2"></div>
            <span>Consulting with a mental health professional for a proper diagnosis</span>
          </li>
          <li className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2"></div>
            <span>Regular check-ins with your healthcare provider</span>
          </li>
          <li className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2"></div>
            <span>Keeping track of your progress and symptoms</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Treatment;