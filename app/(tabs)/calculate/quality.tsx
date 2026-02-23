import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';

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
    editMeetingId?: string;
    editMeetingName?: string;
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

  const editMeetingId = params.editMeetingId;
  const editMeetingName = params.editMeetingName;

  const score = qualityScore(answers);
  const meterColorClass = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-400' : 'bg-red-500';

  const setAnswer = (key: keyof QualityAnswers, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const goBackToCalculate = () => {
    router.back();
  };

  const goToResults = () => {
    router.push({
      pathname: '/(tabs)/calculate/results',
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
        ...(editMeetingId ? { editMeetingId, editMeetingName } : {}),
      },
    } as never);
  };

  return (
    <ScrollView className="flex-1 bg-white px-6" contentContainerClassName="pb-10 pt-8">
      <Text className="text-3xl font-bold text-gray-900">Meeting Quality</Text>
      <Text className="mt-2 text-base leading-6 text-gray-500">Answer in 10 seconds.</Text>

      <View className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
        <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500">Live Score</Text>
        <Text className="mt-2 text-4xl font-extrabold text-gray-900">Score: {score}/100</Text>
        <View className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <View className={`h-3 rounded-full ${meterColorClass}`} style={{ width: `${score}%` }} />
        </View>
      </View>

      <View className="mt-4 rounded-2xl border border-gray-200 bg-white p-2">
        {CHECKS.map((item) => (
          <View key={item.key} className="rounded-xl px-3 py-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-base font-semibold text-gray-900">{item.label}</Text>
                <Text className="mt-1 text-sm leading-5 text-gray-500">{item.helper}</Text>
              </View>
              <Switch
                value={answers[item.key]}
                onValueChange={(value) => setAnswer(item.key, value)}
                trackColor={{ false: '#d1d5db', true: '#22c55e' }}
                thumbColor={answers[item.key] ? '#f4f4f5' : '#e4e4e7'}
              />
            </View>
          </View>
        ))}
      </View>

      <Pressable onPress={goToResults} className="mt-8 rounded-2xl bg-gray-900 px-5 py-4">
        <Text className="text-center text-base font-bold text-white">See Results</Text>
      </Pressable>

      <Pressable onPress={goBackToCalculate} className="mt-3 rounded-2xl border border-gray-300 px-5 py-4">
        <Text className="text-center text-base font-semibold text-gray-700">Back to Calculate</Text>
      </Pressable>
    </ScrollView>
  );
}
