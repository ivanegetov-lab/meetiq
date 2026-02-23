import type { Currency } from '@/lib/calculations';
import type { Severity } from '@/lib/risk';

export type MeetingRow = {
  id: string;
  user_id: string;
  created_at: string;
  name: string;
  attendees: number;
  avg_salary: number;
  duration_minutes: number;
  recurrence: 'weekly' | 'monthly';
  currency: Currency;
  score: number;
  annualized_cost: number;
  annualized_waste: number;
  risk: number;
  severity: Severity;
};

export type SaveMeetingParams = Omit<MeetingRow, 'id' | 'user_id' | 'created_at'>;
