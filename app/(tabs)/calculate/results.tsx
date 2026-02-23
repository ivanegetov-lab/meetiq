import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import RiskBand from '@/components/RiskBand';
import { useAuth } from '@/contexts/AuthContext';
import { useMeetings } from '@/hooks/useMeetings';
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
import type { SaveMeetingParams } from '@/lib/types';

export default function ResultsScreen() {
  const { session, pendingSaveRef } = useAuth();
  const { updateMeeting } = useMeetings();
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

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
    editMeetingId?: string;
    editMeetingName?: string;
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

  const editMeetingId = params.editMeetingId;
  const editMeetingName = params.editMeetingName;
  const isEditing = Boolean(editMeetingId);

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

  const scoreColor = severity === 'good' ? 'text-emerald-600' : severity === 'mid' ? 'text-amber-600' : 'text-red-600';
  const wasteColor = severity === 'good' ? 'text-emerald-600' : severity === 'mid' ? 'text-amber-600' : 'text-red-600';

  const goBack = () => {
    router.back();
  };

  const isRecurring = recurrence === 'weekly' || recurrence === 'monthly';

  const goSave = () => {
    const meetingData: SaveMeetingParams = {
      name: '',
      attendees,
      avg_salary: avgSalary,
      duration_minutes: durationMinutes,
      recurrence: recurrence as 'weekly' | 'monthly',
      currency,
      score,
      annualized_cost: annualized,
      annualized_waste: annualizedWaste,
      risk,
      severity,
    };

    if (!session) {
      // Store meeting data in memory, then redirect to login
      pendingSaveRef.current = meetingData;
      router.push('/login' as never);
      return;
    }

    router.push({
      pathname: '/save-meeting',
      params: {
        attendees: String(attendees),
        avgSalary: String(avgSalary),
        durationMinutes: String(durationMinutes),
        recurrence,
        currency,
        score: String(score),
        annualizedCost: String(annualized),
        annualizedWaste: String(annualizedWaste),
        risk: String(risk),
        severity,
      },
    } as never);
  };

  const goUpdate = async () => {
    if (!editMeetingId) return;
    setUpdating(true);
    setUpdateError(null);

    const { error } = await updateMeeting(editMeetingId, {
      name: editMeetingName ?? '',
      attendees,
      avg_salary: avgSalary,
      duration_minutes: durationMinutes,
      recurrence: recurrence as 'weekly' | 'monthly',
      currency,
      score,
      annualized_cost: annualized,
      annualized_waste: annualizedWaste,
      risk,
      severity,
    });

    setUpdating(false);

    if (error) {
      setUpdateError(error);
    } else {
      router.navigate('/(tabs)' as never);
    }
  };

  const goShare = () => {
    router.push({
      pathname: '/(tabs)/calculate/share',
      params: {
        currency,
        score: String(score),
        risk: String(risk),
        severity,
        costPerMeeting: String(cost),
        annualizedCost: String(annualized),
        annualizedWaste: String(annualizedWaste),
        recurrence,
      },
    } as never);
  };

  return (
    <ScrollView className="flex-1 bg-white px-6" contentContainerClassName="pb-10 pt-8">
      <Text className="text-3xl font-bold text-gray-900">Meeting Impact</Text>
      <Text className="mt-2 text-base leading-6 text-gray-500">
        Financial impact and quality profile for the current meeting design.
      </Text>

      <View className="mt-5 flex-row items-center justify-between rounded-2xl border border-gray-200 bg-white p-4">
        <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500">Quality Score</Text>
        <View className="rounded-full border border-gray-300 px-3 py-1">
          <Text className={`text-lg font-extrabold ${scoreColor}`}>{Math.round(score)}/100</Text>
        </View>
      </View>

      <View className="mt-4 flex-row gap-3">
        <View className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
          <Text className="text-xs uppercase tracking-wide text-gray-500">Annualized Cost</Text>
          <Text className="mt-2 text-3xl font-extrabold text-gray-900">{formatMoney(annualized, currency)}</Text>
        </View>
        <View className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
          <Text className="text-xs uppercase tracking-wide text-gray-500">Cost / Meeting</Text>
          <Text className="mt-2 text-xl font-bold text-gray-700">{formatMoney(cost, currency)}</Text>
          <Text className="mt-2 text-xs text-gray-400">Per person {formatMoney(perPerson, currency)}</Text>
        </View>
      </View>

      <View className="mt-3 flex-row gap-3">
        <View className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
          <Text className="text-xs uppercase tracking-wide text-gray-500">Annualized Waste</Text>
          <Text className={`mt-2 text-3xl font-extrabold ${wasteColor}`}>{formatMoney(annualizedWaste, currency)}</Text>
        </View>
        <View className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
          <Text className="text-xs uppercase tracking-wide text-gray-500">Waste / Meeting</Text>
          <Text className="mt-2 text-xl font-bold text-gray-700">{formatMoney(waste, currency)}</Text>
          <Text className="mt-2 text-xs text-gray-400">Waste: {formatMoney(waste, currency)} ({Math.round(wastePct * 100)}%)</Text>
        </View>
      </View>

      <RiskBand risk={risk} severity={severity} />
      <Text className="mt-2 text-sm text-gray-400">
        Annualized waste used for risk: {formatMoney(annualizedWasteForRisk, currency)}/yr
      </Text>

      <View className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
        <Text className="text-xl font-bold text-gray-900">{message.headline}</Text>
        <Text className="mt-2 text-base leading-6 text-gray-500">{message.body}</Text>
      </View>

      <Pressable onPress={goShare} className="mt-8 rounded-2xl bg-gray-900 px-5 py-4">
        <Text className="text-center text-base font-bold text-white">Share Snapshot</Text>
      </Pressable>

      {isEditing ? (
        <>
          <Pressable
            onPress={goUpdate}
            disabled={updating}
            className={`mt-3 rounded-2xl border px-5 py-4 ${updating ? 'border-gray-200 bg-gray-100' : 'border-emerald-300 bg-emerald-50'}`}>
            {updating ? (
              <ActivityIndicator color="#6b7280" />
            ) : (
              <Text className="text-center text-base font-semibold text-emerald-700">Update Meeting</Text>
            )}
          </Pressable>
          {updateError ? (
            <Text className="mt-2 text-sm text-red-600">{updateError}</Text>
          ) : null}
        </>
      ) : isRecurring ? (
        <Pressable onPress={goSave} className="mt-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4">
          <Text className="text-center text-base font-semibold text-emerald-700">Save to Dashboard</Text>
        </Pressable>
      ) : null}

      <Pressable onPress={goBack} className="mt-3 rounded-2xl border border-gray-300 px-5 py-4">
        <Text className="text-center text-base font-semibold text-gray-700">Back</Text>
      </Pressable>
    </ScrollView>
  );
}
