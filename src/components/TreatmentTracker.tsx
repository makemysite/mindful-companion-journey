
import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Calendar, List } from 'lucide-react';

interface TreatmentSchedule {
  id: string;
  day_number: number;
  day_date: string;
  activities: any[];
  therapies: any[];
  medications: any[];
  exercises: any[];
  completed: boolean;
  treatment_plan_id: string;
}

interface TreatmentPlan {
  duration: string;
}

export function TreatmentTracker() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<TreatmentSchedule[]>([]);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'current' | 'all'>('current');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSchedule() {
      if (!user) return;
      
      // First fetch the treatment plan to get the duration
      const { data: planData, error: planError } = await supabase
        .from('treatment_plans')
        .select('duration')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (planError) {
        console.error('Error fetching treatment plan:', planError);
        setLoading(false);
        return;
      }

      setTreatmentPlan(planData);

      // Then fetch the schedule
      const { data, error } = await supabase
        .from('treatment_schedule')
        .select(`
          *,
          treatment_plans!inner(user_id)
        `)
        .eq('treatment_plans.user_id', user.id)
        .order('day_number', { ascending: true });

      if (error) {
        console.error('Error fetching schedule:', error);
        setLoading(false);
        return;
      }

      console.log('Fetched Treatment Schedule:', data);
      
      if (!data || data.length === 0) {
        console.log('No treatment schedule found');
        setLoading(false);
        return;
      }
      
      const formattedSchedule = data.map((item: any) => ({
        ...item,
        activities: item.activities || [],
        therapies: item.therapies || [],
        medications: item.medications || [],
        exercises: item.exercises || [],
        completed: item.completed || false
      }));
      
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

  const toggleExpand = (dayId: string) => {
    setExpandedDay(expandedDay === dayId ? null : dayId);
  };

  if (loading) {
    return <div className="text-center py-4">Loading treatment tracker...</div>;
  }

  if (schedule.length === 0) {
    return <div className="text-center py-4">No treatment schedule found.</div>;
  }

  const currentDay = schedule.find(day => 
    format(new Date(day.day_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Treatment Tracker</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('current')}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
              viewMode === 'current' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Today</span>
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
              viewMode === 'all' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <List className="h-4 w-4" />
            <span>{treatmentPlan?.duration === 'weekly' ? 'Week' : 'Month'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {viewMode === 'current' && currentDay ? (
          <div className="bg-white p-4 rounded-lg border">
            {/* Render current day schedule */}
            <DaySchedule 
              day={currentDay}
              isExpanded={expandedDay === currentDay.id}
              onToggleExpand={() => toggleExpand(currentDay.id)}
              onToggleCompleted={toggleCompleted}
            />
          </div>
        ) : (
          // Render all days
          schedule.map((day) => (
            <div key={day.id} className="bg-white p-4 rounded-lg border">
              <DaySchedule 
                day={day}
                isExpanded={expandedDay === day.id}
                onToggleExpand={() => toggleExpand(day.id)}
                onToggleCompleted={toggleCompleted}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface DayScheduleProps {
  day: TreatmentSchedule;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleCompleted: (id: string, completed: boolean) => void;
}

function DaySchedule({ day, isExpanded, onToggleExpand, onToggleCompleted }: DayScheduleProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium text-gray-800">
            Day {day.day_number}
          </p>
          <p className="text-sm text-gray-600">
            {format(new Date(day.day_date), 'PPP')}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onToggleCompleted(day.id, !day.completed)}
            className={`px-4 py-2 rounded-lg ${
              day.completed 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {day.completed ? 'Completed' : 'Mark Complete'}
          </button>
          <button onClick={onToggleExpand}>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Activities</h4>
              {day.activities.map((activity, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded mb-2">
                  <p className="font-medium">{activity.name}</p>
                  <p className="text-sm text-gray-600">Duration: {activity.duration}</p>
                </div>
              ))}
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Exercises</h4>
              {day.exercises.map((exercise, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded mb-2">
                  <p className="font-medium">{exercise.name}</p>
                  <p className="text-sm text-gray-600">Duration: {exercise.duration}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Medications</h4>
              {day.medications.map((med, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded mb-2">
                  <p className="font-medium">{med.name}</p>
                  <p className="text-sm text-gray-600">Dosage: {med.dosage}</p>
                </div>
              ))}
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Therapies</h4>
              {day.therapies.map((therapy, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded mb-2">
                  <p className="font-medium">{therapy.name}</p>
                  <p className="text-sm text-gray-600">Duration: {therapy.duration}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
