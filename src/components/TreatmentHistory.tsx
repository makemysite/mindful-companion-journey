
import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

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

      console.log('Fetched Treatment Plans:', data);
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
                Started: {format(new Date(treatment.start_date), 'PPP')}
              </p>
              <p className="text-sm text-gray-600">Duration: {treatment.duration}</p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <h4 className="font-medium text-sm text-gray-700">Medications</h4>
                  <p className="text-sm text-gray-600">
                    {treatment.medications.length} prescribed
                    {treatment.medications.map((med, index) => (
                      <div key={index} className="text-xs text-gray-500">
                        {med.name} ({med.dosage})
                      </div>
                    ))}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-700">Exercises</h4>
                  <p className="text-sm text-gray-600">
                    {treatment.exercises.length} assigned
                    {treatment.exercises.map((exercise, index) => (
                      <div key={index} className="text-xs text-gray-500">
                        {exercise.name} ({exercise.duration})
                      </div>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
