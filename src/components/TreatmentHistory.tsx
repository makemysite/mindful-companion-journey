import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  const [expandedTreatment, setExpandedTreatment] = useState<string | null>(null);

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

  const toggleExpand = (treatmentId: string) => {
    setExpandedTreatment(expandedTreatment === treatmentId ? null : treatmentId);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Treatment History</h2>
      <div className="space-y-4">
        {treatments.map((treatment) => (
          <div key={treatment.id} className="bg-white p-4 rounded-lg border">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpand(treatment.id)}
            >
              <div>
                <p className="font-medium text-gray-800">
                  Started: {format(new Date(treatment.start_date), 'PPP')}
                </p>
                <p className="text-sm text-gray-600">Duration: {treatment.duration}</p>
              </div>
              {expandedTreatment === treatment.id ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
            
            {expandedTreatment === treatment.id && (
              <div className="mt-4 space-y-4">
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Medications</h4>
                  {treatment.medications.length > 0 ? (
                    <div className="grid gap-2">
                      {treatment.medications.map((med, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <p className="font-medium">{med.name}</p>
                          <p className="text-sm text-gray-600">Dosage: {med.dosage}</p>
                          {med.instructions && (
                            <p className="text-sm text-gray-600">Instructions: {med.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No medications prescribed</p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Exercises</h4>
                  {treatment.exercises.length > 0 ? (
                    <div className="grid gap-2">
                      {treatment.exercises.map((exercise, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-sm text-gray-600">Duration: {exercise.duration}</p>
                          {exercise.instructions && (
                            <p className="text-sm text-gray-600">Instructions: {exercise.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No exercises assigned</p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Activities</h4>
                  {treatment.activities.length > 0 ? (
                    <div className="grid gap-2">
                      {treatment.activities.map((activity, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <p className="font-medium">{activity.name}</p>
                          <p className="text-sm text-gray-600">Duration: {activity.duration}</p>
                          {activity.instructions && (
                            <p className="text-sm text-gray-600">Instructions: {activity.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No activities assigned</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
