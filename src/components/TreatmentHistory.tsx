
import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface TreatmentPlan {
  id: string;
  created_at: string;
  start_date: string;
  duration: string;
  medications: any[];
  exercises: any[];
  activities: any[];
}

export function TreatmentHistory() {
  const { user } = useAuth();
  const [treatments, setTreatments] = useState<TreatmentPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTreatments() {
      if (!user) return;
      const { data, error } = await supabase
        .from('treatment_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching treatments:', error);
        return;
      }

      setTreatments(data);
      setLoading(false);
    }

    fetchTreatments();
  }, [user]);

  if (loading) {
    return <div className="text-center py-4">Loading treatment history...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Treatment History</h2>
      <div className="space-y-4">
        {treatments.map((treatment) => (
          <div key={treatment.id} className="bg-white p-4 rounded-lg border">
            <div className="space-y-2">
              <p className="font-medium text-gray-800">
                Started: {new Date(treatment.start_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">Duration: {treatment.duration}</p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <h4 className="font-medium text-sm text-gray-700">Medications</h4>
                  <p className="text-sm text-gray-600">{treatment.medications.length} prescribed</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-700">Exercises</h4>
                  <p className="text-sm text-gray-600">{treatment.exercises.length} assigned</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
