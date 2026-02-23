import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { MeetingRow, SaveMeetingParams } from '@/lib/types';

export function useMeetings() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<MeetingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    if (!user) {
      setMeetings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('meetings')
      .select('*')
      .eq('user_id', user.id)
      .order('annualized_cost', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setMeetings(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const saveMeeting = async (meeting: SaveMeetingParams) => {
    if (!user) return { error: 'Not authenticated' };

    const { error: insertError } = await supabase.from('meetings').insert({
      ...meeting,
      user_id: user.id,
    });

    if (!insertError) await fetchMeetings();
    return { error: insertError?.message ?? null };
  };

  const updateMeeting = async (id: string, meeting: SaveMeetingParams) => {
    if (!user) return { error: 'Not authenticated' };

    const { error: updateError } = await supabase
      .from('meetings')
      .update({
        name: meeting.name,
        attendees: meeting.attendees,
        avg_salary: meeting.avg_salary,
        duration_minutes: meeting.duration_minutes,
        recurrence: meeting.recurrence,
        currency: meeting.currency,
        score: meeting.score,
        annualized_cost: meeting.annualized_cost,
        annualized_waste: meeting.annualized_waste,
        risk: meeting.risk,
        severity: meeting.severity,
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (!updateError) await fetchMeetings();
    return { error: updateError?.message ?? null };
  };

  const deleteMeeting = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id);

    if (!deleteError) await fetchMeetings();
    return { error: deleteError?.message ?? null };
  };

  const meetingCount = meetings.length;

  return {
    meetings,
    loading,
    error,
    saveMeeting,
    updateMeeting,
    deleteMeeting,
    meetingCount,
    refetch: fetchMeetings,
  };
}
