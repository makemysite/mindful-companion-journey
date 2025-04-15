
import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { AssessmentResult } from '../types/assessment';
import { format } from 'date-fns';

export function AssessmentHistory() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssessments() {
      if (!user) return;
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assessments:', error);
        return;
      }

      setAssessments(data);
      setLoading(false);
    }

    fetchAssessments();
  }, [user]);

  if (loading) {
    return <div className="text-center py-4">Loading assessment history...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Assessment History</h2>
      <div className="space-y-4">
        {assessments.map((assessment) => (
          <div key={assessment.timestamp.toString()} className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-800">
                  Primary Condition: {assessment.primaryCondition}
                </p>
                <p className="text-sm text-gray-600">
                  Date: {format(new Date(assessment.timestamp), 'PPP')}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-sm ${
                assessment.severity === 'severe' ? 'bg-red-100 text-red-800' :
                assessment.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {assessment.severity}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
