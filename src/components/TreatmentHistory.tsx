
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching treatments:', error);
        setLoading(false);
        return;
      }

      console.log('Fetched Treatment Plans:', data);
      
      if (!data || data.length === 0) {
        console.log('No treatment plans found');
        setLoading(false);
        return;
      }
      
      // Ensure all treatment plans have the expected structure
      const formattedTreatments = data.map((treatment: any) => ({
        ...treatment,
        medications: treatment.medications || [],
        exercises: treatment.exercises || [],
        activities: treatment.activities || [],
        start_date: treatment.start_date || treatment.created_at
      }));
      
      console.log('Formatted treatment plans:', formattedTreatments);
      setTreatments(formattedTreatments);
      setLoading(false);
    }

    fetchTreatments();
  }, [user]);

  if (loading) {
    return <div className="text-center py-4">Loading treatment history...</div>;
  }

  if (treatments.length === 0) {
    return <div className="text-center py-4">No treatment history found.</div>;
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
                  </p>
                  {treatment.medications.map((med, index) => (
                    <div key={index} className="text-xs text-gray-500">
                      {med.name} ({med.dosage})
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-700">Exercises</h4>
                  <p className="text-sm text-gray-600">
                    {treatment.exercises.length} assigned
                  </p>
                  {treatment.exercises.map((exercise, index) => (
                    <div key={index} className="text-xs text-gray-500">
                      {exercise.name} ({exercise.duration})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
