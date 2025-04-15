
import React, { useState } from 'react';
import { Brain, ClipboardCheck, MessageSquareText, Pill } from 'lucide-react';
import { AuthProvider } from './components/AuthProvider';
import { AuthPage } from './components/AuthPage';
import { useAuth } from './lib/auth';
import Questionnaire from './components/Questionnaire';
import Dashboard from './components/Dashboard';
import Treatment from './components/Treatment';
import Chat from './components/Chat';
import { AssessmentResult } from './types/assessment';

function AppContent() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [diagnosis, setDiagnosis] = useState<AssessmentResult | null>(null);

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-semibold text-gray-800">MindWell AI</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => signOut()}
                className="text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-[240px_1fr] gap-6">
          {/* Sidebar */}
          <div className="bg-white rounded-lg shadow-md p-4 h-fit">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'dashboard' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                }`}
              >
                <ClipboardCheck size={20} />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('assessment')}
                className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'assessment' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                }`}
              >
                <ClipboardCheck size={20} />
                <span>Assessment</span>
              </button>
              <button
                onClick={() => setActiveTab('treatment')}
                className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'treatment' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                }`}
              >
                <Pill size={20} />
                <span>Treatment Plan</span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'chat' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                }`}
              >
                <MessageSquareText size={20} />
                <span>AI Assistant</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeTab === 'dashboard' && <Dashboard assessmentCompleted={assessmentCompleted} diagnosis={diagnosis} />}
            {activeTab === 'assessment' && (
              <Questionnaire 
                onComplete={(results) => {
                  setAssessmentCompleted(true);
                  setDiagnosis(results);
                  setActiveTab('treatment');
                }}
              />
            )}
            {activeTab === 'treatment' && <Treatment diagnosis={diagnosis} />}
            {activeTab === 'chat' && <Chat />}
          </div>
        </div>
      </div>

      <footer className="bg-white mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p className="text-sm">
            Disclaimer: This is an AI-powered support tool and should not replace professional medical advice.
            If you're experiencing a mental health emergency, please contact emergency services or crisis helpline immediately.
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
