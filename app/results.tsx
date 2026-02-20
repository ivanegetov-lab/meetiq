import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import RiskBand from '@/components/RiskBand';
import {
  annualizedCost,
  costPerPerson,
  formatMoney,
  meetingCost,
  type Currency,
  type Recurrence,
} from '@/lib/calculations';
import { meetingMessage } from '@/lib/messaging';
import { computeRisk, severityFromScore } from '@/lib/risk';
import { qualityScore, type QualityAnswers } from '@/lib/scoring';

export default function ResultsScreen() {
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
    score?: string;
  }>();

  const parseBoolean = (value?: string) => value === 'true';
  const parseNumber = (value: string | undefined, fallback: number) => {
    const parsed = Number.parseFloat(value ?? '');
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const attendees = parseNumber(params.attendees, 6);
  const avgSalary = parseNumber(params.avgSalary, 100000);
  const durationMinutes = parseNumber(params.durationMinutes, 60);
  const recurrence: Recurrence =
    params.recurrence === 'weekly' || params.recurrence === 'monthly' ? params.recurrence : 'one-time';
  const currency: Currency = params.currency === 'EUR' ? 'EUR' : 'USD';

  const answers: QualityAnswers = {
    goalDefined: parseBoolean(params.goalDefined),
    ownerAssigned: parseBoolean(params.ownerAssigned),
    prereadSent: parseBoolean(params.prereadSent),
    decisionMade: parseBoolean(params.decisionMade),
    nextActionsClear: parseBoolean(params.nextActionsClear),
  };

  const fallbackScore = qualityScore(answers);
  const incomingScore = parseNumber(params.score, fallbackScore);
  const score = Math.max(0, Math.min(100, incomingScore));

  const cost = meetingCost(attendees, avgSalary, durationMinutes);
  const annualized = annualizedCost(cost, recurrence);
  const perPerson = costPerPerson(cost, attendees);
  const waste = cost * (1 - score / 100);
  const annualizedWaste = annualized * (1 - score / 100);
  const { risk, wastePct, annualizedWaste: annualizedWasteForRisk } = computeRisk({
    score,
    annualizedCost: annualized,
    maxAnnualWaste: 250000,
  });
  const severity = severityFromScore(score);

  const message = meetingMessage({
    score,
    wasteDollars: waste,
    annualizedWaste,
    cost,
    annualizedCost: annualized,
    currency,
  });

  const scoreColor = severity === 'good' ? 'text-emerald-400' : severity === 'mid' ? 'text-amber-300' : 'text-red-400';
  const wasteColor = severity === 'good' ? 'text-emerald-400' : severity === 'mid' ? 'text-amber-300' : 'text-red-400';

  const goBack = () => {
    router.push({
      pathname: '/quality',
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
      },
    } as never);
  };

  const goShare = () => {
    router.push({
      pathname: '/share',
      params: {
        currency,
        score: String(score),
        risk: String(risk),
        severity,
        costPerMeeting: String(cost),
        annualizedCost: String(annualized),
        annualizedWaste: String(annualizedWaste),
      },
    } as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView className="flex-1 px-6" contentContainerClassName="pb-10 pt-8">
        <Text className="text-3xl font-bold text-white">Meeting Impact</Text>
        <Text className="mt-2 text-base leading-6 text-zinc-400">
          Financial impact and quality profile for the current meeting design.
        </Text>

        <View className="mt-5 flex-row items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Quality Score</Text>
          <View className="rounded-full border border-zinc-700 px-3 py-1">
            <Text className={`text-lg font-extrabold ${scoreColor}`}>{Math.round(score)}/100</Text>
          </View>
        </View>

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <Text className="text-xs uppercase tracking-wide text-zinc-400">Annualized Cost</Text>
            <Text className="mt-2 text-3xl font-extrabold text-white">{formatMoney(annualized, currency)}</Text>
          </View>
          <View className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <Text className="text-xs uppercase tracking-wide text-zinc-400">Cost / Meeting</Text>
            <Text className="mt-2 text-xl font-bold text-zinc-200">{formatMoney(cost, currency)}</Text>
            <Text className="mt-2 text-xs text-zinc-500">Per person {formatMoney(perPerson, currency)}</Text>
          </View>
        </View>

        <View className="mt-3 flex-row gap-3">
          <View className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <Text className="text-xs uppercase tracking-wide text-zinc-400">Annualized Waste</Text>
            <Text className={`mt-2 text-3xl font-extrabold ${wasteColor}`}>{formatMoney(annualizedWaste, currency)}</Text>
          </View>
          <View className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <Text className="text-xs uppercase tracking-wide text-zinc-400">Waste / Meeting</Text>
            <Text className="mt-2 text-xl font-bold text-zinc-200">{formatMoney(waste, currency)}</Text>
            <Text className="mt-2 text-xs text-zinc-500">Waste: {formatMoney(waste, currency)} ({Math.round(wastePct * 100)}%)</Text>
          </View>
        </View>

        <RiskBand risk={risk} severity={severity} />
        <Text className="mt-2 text-sm text-zinc-500">
          Annualized waste used for risk: {formatMoney(annualizedWasteForRisk, currency)}/yr
        </Text>

        <View className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <Text className="text-xl font-bold text-white">{message.headline}</Text>
          <Text className="mt-2 text-base leading-6 text-zinc-300">{message.body}</Text>
        </View>

        <Pressable onPress={goShare} className="mt-8 rounded-2xl bg-white px-5 py-4">
          <Text className="text-center text-base font-bold text-zinc-950">Share Snapshot</Text>
        </Pressable>

        <Pressable onPress={goBack} className="mt-3 rounded-2xl border border-zinc-700 px-5 py-4">
          <Text className="text-center text-base font-semibold text-zinc-200">Back</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
