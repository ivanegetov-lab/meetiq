import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type Currency, type Recurrence } from '@/lib/calculations';
import { qualityScore, type QualityAnswers } from '@/lib/scoring';

const CHECKS: Array<{
  key: keyof QualityAnswers;
  label: string;
  helper: string;
}> = [
  { key: 'goalDefined', label: 'Goal Defined', helper: 'The desired outcome was explicit.' },
  { key: 'ownerAssigned', label: 'Owner Assigned', helper: 'One person owns each decision or task.' },
  { key: 'prereadSent', label: 'Pre-read Sent', helper: 'Context was shared before the meeting.' },
  { key: 'decisionMade', label: 'Decision Made', helper: 'A concrete decision was reached.' },
  { key: 'nextActionsClear', label: 'Next Actions Clear', helper: 'Actions, owners, and timelines are clear.' },
];

export default function QualityScreen() {
  const params = useLocalSearchParams<{
    attendees?: string;
    avgSalary?: string;
    durationMinutes?: string;
    recurrence?: Recurrence;
    currency?: Currency;
    goalDefined?: string;
    ownerAssigned?: string;
    prereadSent?: string;
    decisionMade?: string;
    nextActionsClear?: string;
  }>();

  const parseBoolean = (value?: string) => value === 'true';

  const [answers, setAnswers] = React.useState<QualityAnswers>({
    goalDefined: parseBoolean(params.goalDefined),
    ownerAssigned: parseBoolean(params.ownerAssigned),
    prereadSent: parseBoolean(params.prereadSent),
    decisionMade: parseBoolean(params.decisionMade),
    nextActionsClear: parseBoolean(params.nextActionsClear),
  });

  const attendees = Number.parseInt(params.attendees ?? '6', 10) || 6;
  const avgSalary = Number.parseInt(params.avgSalary ?? '100000', 10) || 100000;
  const durationMinutes = Number.parseInt(params.durationMinutes ?? '60', 10) || 60;
  const recurrence: Recurrence =
    params.recurrence === 'weekly' || params.recurrence === 'monthly' ? params.recurrence : 'one-time';
  const currency: Currency = params.currency === 'EUR' ? 'EUR' : 'USD';

  const score = qualityScore(answers);
  const meterColorClass = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-400' : 'bg-red-500';

  const setAnswer = (key: keyof QualityAnswers, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const goBackToCalculate = () => {
    router.push({
      pathname: '/calculate',
      params: {
        attendees: String(attendees),
        avgSalary: String(avgSalary),
        durationMinutes: String(durationMinutes),
        recurrence,
        currency,
      },
    } as never);
  };

  const goToResults = () => {
    router.push({
      pathname: '/results',
      params: {
        attendees: String(attendees),
        avgSalary: String(avgSalary),
        durationMinutes: String(durationMinutes),
        recurrence,
        currency,
        goalDefined: String(answers.goalDefined),
        ownerAssigned: String(answers.ownerAssigned),
        prereadSent: String(answers.prereadSent),
        decisionMade: String(answers.decisionMade),
        nextActionsClear: String(answers.nextActionsClear),
        score: String(score),
      },
    } as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView className="flex-1 px-6" contentContainerClassName="pb-10 pt-8">
        <Text className="text-3xl font-bold text-white">Meeting Quality</Text>
        <Text className="mt-2 text-base leading-6 text-zinc-400">Answer in 10 seconds.</Text>

        <View className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Live Score</Text>
          <Text className="mt-2 text-4xl font-extrabold text-white">Score: {score}/100</Text>
          <View className="mt-4 h-3 w-full overflow-hidden rounded-full bg-zinc-800">
            <View className={`h-3 rounded-full ${meterColorClass}`} style={{ width: `${score}%` }} />
          </View>
        </View>

        <View className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-2">
          {CHECKS.map((item) => (
            <View key={item.key} className="rounded-xl px-3 py-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                  <Text className="text-base font-semibold text-white">{item.label}</Text>
                  <Text className="mt-1 text-sm leading-5 text-zinc-400">{item.helper}</Text>
                </View>
                <Switch
                  value={answers[item.key]}
                  onValueChange={(value) => setAnswer(item.key, value)}
                  trackColor={{ false: '#3f3f46', true: '#22c55e' }}
                  thumbColor={answers[item.key] ? '#f4f4f5' : '#e4e4e7'}
                />
              </View>
            </View>
          ))}
        </View>

        <Pressable onPress={goToResults} className="mt-8 rounded-2xl bg-white px-5 py-4">
          <Text className="text-center text-base font-bold text-zinc-950">See Results</Text>
        </Pressable>

        <Pressable onPress={goBackToCalculate} className="mt-3 rounded-2xl border border-zinc-700 px-5 py-4">
          <Text className="text-center text-base font-semibold text-zinc-200">Back to Calculate</Text>
        </Pressable>

        <Text className="mt-6 text-xs leading-5 text-zinc-500">
          Passed forward: attendees, avgSalary, durationMinutes, recurrence, currency.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
