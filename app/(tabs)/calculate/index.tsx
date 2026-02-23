import React, { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import {
  annualizedCost,
  formatMoney,
  meetingCost,
  type Currency,
  type Recurrence,
} from '@/lib/calculations';

const MIN_ATTENDEES = 1;
const MIN_SALARY = 30000;
const MAX_SALARY = 500000;
const MIN_DURATION = 5;
const MAX_DURATION = 240;

export default function CalculateScreen() {
  const params = useLocalSearchParams<{
    attendees?: string;
    avgSalary?: string;
    durationMinutes?: string;
    recurrence?: string;
    currency?: string;
    editMeetingId?: string;
    editMeetingName?: string;
  }>();

  const [attendees, setAttendees] = React.useState(6);
  const [avgSalary, setAvgSalary] = React.useState(100000);
  const [salaryInput, setSalaryInput] = React.useState('100000');
  const [durationMinutes, setDurationMinutes] = React.useState(60);
  const [recurrence, setRecurrence] = React.useState<Recurrence>('one-time');
  const [currency, setCurrency] = React.useState<Currency>('USD');

  const editMeetingId = params.editMeetingId;
  const editMeetingName = params.editMeetingName;
  const isEditing = Boolean(editMeetingId);

  // Pre-fill form when editing
  useEffect(() => {
    if (!editMeetingId) return;
    if (params.attendees) setAttendees(Number.parseInt(params.attendees, 10) || 6);
    if (params.avgSalary) {
      const salary = Number.parseInt(params.avgSalary, 10) || 100000;
      setAvgSalary(salary);
      setSalaryInput(String(salary));
    }
    if (params.durationMinutes) setDurationMinutes(Number.parseInt(params.durationMinutes, 10) || 60);
    if (params.recurrence === 'weekly' || params.recurrence === 'monthly') {
      setRecurrence(params.recurrence);
    }
    if (params.currency === 'EUR') setCurrency('EUR');
    else if (params.currency === 'USD') setCurrency('USD');
  }, [editMeetingId]);

  const clampedAttendees = Math.max(MIN_ATTENDEES, attendees);
  const clampedSalary = Math.min(MAX_SALARY, Math.max(MIN_SALARY, avgSalary));
  const clampedDuration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, durationMinutes));

  const costPerMeeting = meetingCost(clampedAttendees, clampedSalary, clampedDuration);
  const costAnnualized = annualizedCost(costPerMeeting, recurrence);
  const costPerPerson = clampedAttendees > 0 ? costPerMeeting / clampedAttendees : 0;

  const attendeeError = attendees < MIN_ATTENDEES ? `Attendees must be at least ${MIN_ATTENDEES}.` : null;
  const salaryError =
    avgSalary < MIN_SALARY || avgSalary > MAX_SALARY
      ? `Salary must be between ${MIN_SALARY.toLocaleString()} and ${MAX_SALARY.toLocaleString()}.`
      : null;
  const durationError =
    durationMinutes < MIN_DURATION || durationMinutes > MAX_DURATION
      ? `Duration must be between ${MIN_DURATION} and ${MAX_DURATION} minutes.`
      : null;

  const hasErrors = Boolean(attendeeError || salaryError || durationError);

  const adjustAttendees = (delta: number) => setAttendees((value) => Math.max(MIN_ATTENDEES, value + delta));
  const adjustDuration = (delta: number) =>
    setDurationMinutes((value) => Math.min(MAX_DURATION, Math.max(MIN_DURATION, value + delta)));

  const onSalaryChange = (rawValue: string) => {
    const numericOnly = rawValue.replace(/[^0-9]/g, '');
    setSalaryInput(numericOnly);
    const parsed = Number.parseInt(numericOnly || '0', 10);
    setAvgSalary(Number.isNaN(parsed) ? 0 : parsed);
  };

  const onSalaryBlur = () => {
    const sanitized = Math.min(MAX_SALARY, Math.max(MIN_SALARY, avgSalary || MIN_SALARY));
    setAvgSalary(sanitized);
    setSalaryInput(String(sanitized));
  };

  const goToQuality = () => {
    if (hasErrors) return;
    router.push({
      pathname: '/(tabs)/calculate/quality',
      params: {
        attendees: String(clampedAttendees),
        avgSalary: String(clampedSalary),
        durationMinutes: String(clampedDuration),
        recurrence,
        currency,
        ...(editMeetingId ? { editMeetingId, editMeetingName } : {}),
      },
    } as never);
  };

  return (
    <ScrollView className="flex-1 bg-white px-6" contentContainerClassName="pb-10 pt-8">
      {isEditing ? (
        <Text className="text-3xl font-bold text-gray-900">Edit: {editMeetingName}</Text>
      ) : (
        <Text className="text-3xl font-bold text-gray-900">Meeting Inputs</Text>
      )}
      <Text className="mt-3 text-base leading-6 text-gray-500">
        Set your baseline and see the cost update instantly.
      </Text>

      <View className="mt-8 rounded-2xl border border-gray-200 bg-white p-4">
        <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500">Attendees</Text>
        <View className="mt-3 flex-row items-center justify-between">
          <StepperButton label="−" onPress={() => adjustAttendees(-1)} />
          <Text className="text-3xl font-bold text-gray-900">{clampedAttendees}</Text>
          <StepperButton label="+" onPress={() => adjustAttendees(1)} />
        </View>
        {attendeeError ? <Text className="mt-3 text-sm text-red-600">{attendeeError}</Text> : null}
      </View>

      <View className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
        <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500">Average Salary</Text>
        <View className="mt-3 rounded-xl border border-gray-300 bg-white px-4 py-3">
          <TextInput
            value={salaryInput}
            onChangeText={onSalaryChange}
            onBlur={onSalaryBlur}
            keyboardType="number-pad"
            placeholder="100000"
            placeholderTextColor="#9ca3af"
            className="text-2xl font-semibold text-gray-900"
          />
        </View>
        {salaryError ? <Text className="mt-3 text-sm text-red-600">{salaryError}</Text> : null}
      </View>

      <View className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
        <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500">Duration (minutes)</Text>
        <View className="mt-3 flex-row items-center justify-between">
          <StepperButton label="−" onPress={() => adjustDuration(-5)} />
          <Text className="text-3xl font-bold text-gray-900">{clampedDuration}</Text>
          <StepperButton label="+" onPress={() => adjustDuration(5)} />
        </View>
        {durationError ? <Text className="mt-3 text-sm text-red-600">{durationError}</Text> : null}
      </View>

      <View className="mt-4">
        <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Recurrence</Text>
        <View className="flex-row rounded-2xl border border-gray-200 bg-gray-100 p-1">
          {(['one-time', 'weekly', 'monthly'] as Recurrence[]).map((option) => {
            const selected = recurrence === option;
            return (
              <Pressable
                key={option}
                onPress={() => setRecurrence(option)}
                className={`flex-1 rounded-xl px-3 py-2 ${selected ? 'bg-gray-900' : ''}`}>
                <Text className={`text-center text-sm font-semibold ${selected ? 'text-white' : 'text-gray-500'}`}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="mt-4">
        <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Currency</Text>
        <View className="flex-row gap-3">
          {(['USD', 'EUR'] as Currency[]).map((option) => {
            const selected = currency === option;
            return (
              <Pressable
                key={option}
                onPress={() => setCurrency(option)}
                className={`rounded-xl border px-4 py-2 ${selected ? 'border-gray-900 bg-gray-900' : 'border-gray-300 bg-white'}`}>
                <Text className={`text-sm font-semibold ${selected ? 'text-white' : 'text-gray-500'}`}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="mt-8 rounded-2xl border border-gray-200 bg-white p-4">
        <Text className="text-base font-bold text-gray-900">Live Preview</Text>
        <PreviewRow label="Cost per meeting" value={formatMoney(costPerMeeting, currency)} />
        <PreviewRow label="Annualized cost" value={formatMoney(costAnnualized, currency)} />
        <PreviewRow label="Cost per person" value={formatMoney(costPerPerson, currency)} />
      </View>

      <Pressable
        onPress={goToQuality}
        disabled={hasErrors}
        className={`mt-8 rounded-2xl px-5 py-4 ${hasErrors ? 'bg-gray-200' : 'bg-gray-900'}`}>
        <Text className={`text-center text-base font-bold ${hasErrors ? 'text-gray-400' : 'text-white'}`}>
          Next: Meeting Quality
        </Text>
      </Pressable>
    </ScrollView>
  );
}

type StepperButtonProps = {
  label: string;
  onPress: () => void;
};

function StepperButton({ label, onPress }: StepperButtonProps) {
  return (
    <Pressable onPress={onPress} className="h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
      <Text className="text-2xl font-bold text-gray-900">{label}</Text>
    </Pressable>
  );
}

type PreviewRowProps = {
  label: string;
  value: string;
};

function PreviewRow({ label, value }: PreviewRowProps) {
  return (
    <View className="mt-4 flex-row items-center justify-between">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-lg font-bold text-gray-900">{value}</Text>
    </View>
  );
}
