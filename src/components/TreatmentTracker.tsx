
import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface TreatmentSchedule {
  id: string;
  day_number: number;
  day_date: string;
  activities: any[];
  therapies: any[];
  medications: any[];
  exercises: any[];
  completed: boolean;
}

export function TreatmentTracker() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<TreatmentSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchedule() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('treatment_schedule')
        .select('*')
        .order('day_number', { ascending: true });

      if (error) {
        console.error('Error fetching schedule:', error);
        return;
      }

      console.log('Fetched Treatment Schedule:', data);
      
      if (!data || data.length === 0) {
        console.log('No treatment schedule found');
        setLoading(false);
        return;
      }
      
      // Ensure all schedule items have the expected structure
      const formattedSchedule = data.map((item: any) => ({
        ...item,
        activities: item.activities || [],
        therapies: item.therapies || [],
        medications: item.medications || [],
        exercises: item.exercises || [],
        completed: item.completed || false
      }));
      
      console.log('Formatted treatment schedule:', formattedSchedule);
      setSchedule(formattedSchedule);
      setLoading(false);
    }

    fetchSchedule();
  }, [user]);

  const toggleCompleted = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('treatment_schedule')
        .update({ completed })
        .eq('id', id);

      if (error) {
        console.error('Error updating schedule:', error);
        return;
      }

      setSchedule(schedule.map(item => 
        item.id === id ? { ...item, completed } : item
      ));
    } catch (error) {
      console.error('Error in toggleCompleted:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading treatment tracker...</div>;
  }

  if (schedule.length === 0) {
    return <div className="text-center py-4">No treatment schedule found.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Treatment Tracker</h2>
      <div className="space-y-4">
        {schedule.map((day) => (
          <div key={day.id} className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">
                  Day {day.day_number}
                </p>
                <p className="text-sm text-gray-600">
                  {format(new Date(day.day_date), 'PPP')}
                </p>
              </div>
              <button
                onClick={() => toggleCompleted(day.id, !day.completed)}
                className={`px-4 py-2 rounded-lg ${
                  day.completed 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day.completed ? 'Completed' : 'Mark Complete'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-medium text-sm text-gray-700">Activities</h4>
                <p className="text-sm text-gray-600">{day.activities.length} planned</p>
                {day.activities.map((activity, index) => (
                  <div key={index} className="text-xs text-gray-500">
                    {activity.name} ({activity.duration})
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700">Exercises</h4>
                <p className="text-sm text-gray-600">{day.exercises.length} assigned</p>
                {day.exercises.map((exercise, index) => (
                  <div key={index} className="text-xs text-gray-500">
                    {exercise.name} ({exercise.duration})
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
