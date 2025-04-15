import { Calendar, HeartPulse, Brain, Activity, ClipboardCheck } from 'lucide-react';
import { AssessmentResult } from '../types/assessment';
import { AssessmentHistory } from './AssessmentHistory';
import { TreatmentHistory } from './TreatmentHistory';
import { TreatmentTracker } from './TreatmentTracker';

interface DashboardProps {
  assessmentCompleted: boolean;
  diagnosis: AssessmentResult | null;
}

function Dashboard({ assessmentCompleted, diagnosis }: DashboardProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Welcome to MindWell AI</h1>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-purple-600" />
            <h2 className="text-lg font-medium text-gray-800">Mental Health Assessment</h2>
          </div>
          {!assessmentCompleted ? (
            <p className="mt-2 text-gray-600">
              Take our comprehensive assessment to receive personalized insights and recommendations.
            </p>
          ) : (
            <p className="mt-2 text-gray-600">
              Assessment completed. View your personalized treatment plan for detailed recommendations.
            </p>
          )}
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-100">
          <div className="flex items-center space-x-3">
            <HeartPulse className="h-8 w-8 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-800">Daily Wellness</h2>
          </div>
          <p className="mt-2 text-gray-600">
            Track your mood, symptoms, and progress with our daily wellness tools.
          </p>
        </div>
      </div>

      {/* Treatment Tracker */}
      <div className="bg-white rounded-lg border p-6">
        <TreatmentTracker />
      </div>

      {/* History Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <AssessmentHistory />
        </div>
        <div className="bg-white rounded-lg border p-6">
          <TreatmentHistory />
        </div>
      </div>

      {/* How it works section */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">How MindWell AI Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
              <ClipboardCheck className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium">Assessment</h3>
            <p className="text-sm text-gray-600">Complete our comprehensive mental health questionnaire</p>
          </div>
          <div className="space-y-2">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium">Analysis</h3>
            <p className="text-sm text-gray-600">Receive AI-powered insights and potential diagnosis</p>
          </div>
          <div className="space-y-2">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium">Treatment Plan</h3>
            <p className="text-sm text-gray-600">Get a personalized plan with exercises and recommendations</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
