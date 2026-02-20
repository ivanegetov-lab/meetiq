import React from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [attendees, setAttendees] = React.useState(6);
  const [avgSalary, setAvgSalary] = React.useState(100000);
  const [salaryInput, setSalaryInput] = React.useState('100000');
  const [durationMinutes, setDurationMinutes] = React.useState(60);
  const [recurrence, setRecurrence] = React.useState<Recurrence>('one-time');
  const [currency, setCurrency] = React.useState<Currency>('USD');

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
      pathname: '/quality',
      params: {
        attendees: String(clampedAttendees),
        avgSalary: String(clampedSalary),
        durationMinutes: String(clampedDuration),
        recurrence,
        currency,
      },
    } as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView className="flex-1 px-6" contentContainerClassName="pb-10 pt-8">
        <Text className="text-3xl font-bold text-white">Meeting Inputs</Text>
        <Text className="mt-3 text-base leading-6 text-zinc-400">
          Set your baseline and see the cost update instantly.
        </Text>

        <View className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Attendees</Text>
          <View className="mt-3 flex-row items-center justify-between">
            <StepperButton label="−" onPress={() => adjustAttendees(-1)} />
            <Text className="text-3xl font-bold text-white">{clampedAttendees}</Text>
            <StepperButton label="+" onPress={() => adjustAttendees(1)} />
          </View>
          {attendeeError ? <Text className="mt-3 text-sm text-red-400">{attendeeError}</Text> : null}
        </View>

        <View className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Average Salary</Text>
          <View className="mt-3 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3">
            <TextInput
              value={salaryInput}
              onChangeText={onSalaryChange}
              onBlur={onSalaryBlur}
              keyboardType="number-pad"
              placeholder="100000"
              placeholderTextColor="#71717a"
              className="text-2xl font-semibold text-white"
            />
          </View>
          {salaryError ? <Text className="mt-3 text-sm text-red-400">{salaryError}</Text> : null}
        </View>

        <View className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Duration (minutes)</Text>
          <View className="mt-3 flex-row items-center justify-between">
            <StepperButton label="−" onPress={() => adjustDuration(-5)} />
            <Text className="text-3xl font-bold text-white">{clampedDuration}</Text>
            <StepperButton label="+" onPress={() => adjustDuration(5)} />
          </View>
          {durationError ? <Text className="mt-3 text-sm text-red-400">{durationError}</Text> : null}
        </View>

        <View className="mt-4">
          <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">Recurrence</Text>
          <View className="flex-row rounded-2xl border border-zinc-800 bg-zinc-900 p-1">
            {(['one-time', 'weekly', 'monthly'] as Recurrence[]).map((option) => {
              const selected = recurrence === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setRecurrence(option)}
                  className={`flex-1 rounded-xl px-3 py-2 ${selected ? 'bg-white' : ''}`}>
                  <Text className={`text-center text-sm font-semibold ${selected ? 'text-zinc-950' : 'text-zinc-300'}`}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-4">
          <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">Currency</Text>
          <View className="flex-row gap-3">
            {(['USD', 'EUR'] as Currency[]).map((option) => {
              const selected = currency === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setCurrency(option)}
                  className={`rounded-xl border px-4 py-2 ${selected ? 'border-white bg-white' : 'border-zinc-700 bg-zinc-900'}`}>
                  <Text className={`text-sm font-semibold ${selected ? 'text-zinc-950' : 'text-zinc-300'}`}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <Text className="text-base font-bold text-white">Live Preview</Text>
          <PreviewRow label="Cost per meeting" value={formatMoney(costPerMeeting, currency)} />
          <PreviewRow label="Annualized cost" value={formatMoney(costAnnualized, currency)} />
          <PreviewRow label="Cost per person" value={formatMoney(costPerPerson, currency)} />
        </View>

        <Pressable
          onPress={goToQuality}
          disabled={hasErrors}
          className={`mt-8 rounded-2xl px-5 py-4 ${hasErrors ? 'bg-zinc-700' : 'bg-white'}`}>
          <Text className={`text-center text-base font-bold ${hasErrors ? 'text-zinc-300' : 'text-zinc-950'}`}>
            Next: Meeting Quality
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

type StepperButtonProps = {
  label: string;
  onPress: () => void;
};

function StepperButton({ label, onPress }: StepperButtonProps) {
  return (
    <Pressable onPress={onPress} className="h-11 w-11 items-center justify-center rounded-xl bg-zinc-800">
      <Text className="text-2xl font-bold text-white">{label}</Text>
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
      <Text className="text-sm text-zinc-400">{label}</Text>
      <Text className="text-lg font-bold text-white">{value}</Text>
    </View>
  );
}
