import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { useMeetings } from '@/hooks/useMeetings';
import { formatMoney, type Currency } from '@/lib/calculations';
import { FREE_MEETING_LIMIT } from '@/lib/limits';
import type { Severity } from '@/lib/risk';

export default function SaveMeetingScreen() {
  const { pendingSaveRef } = useAuth();
  const { saveMeeting, meetingCount } = useMeetings();

  const params = useLocalSearchParams<{
    name?: string;
    attendees?: string;
    avgSalary?: string;
    durationMinutes?: string;
    recurrence?: string;
    currency?: string;
    score?: string;
    annualizedCost?: string;
    annualizedWaste?: string;
    risk?: string;
    severity?: string;
  }>();

  const [name, setName] = useState(params.name ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const currency = (params.currency ?? 'USD') as Currency;
  const annualizedCost = Number.parseFloat(params.annualizedCost ?? '0');
  const annualizedWaste = Number.parseFloat(params.annualizedWaste ?? '0');
  const score = Number.parseInt(params.score ?? '0', 10);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter a meeting name.');
      return;
    }

    // Check free limit before saving
    if (meetingCount >= FREE_MEETING_LIMIT) {
      // Clear pending save ref since we're going to paywall
      pendingSaveRef.current = null;
      router.replace({
        pathname: '/paywall',
        params: {
          totalCost: String(annualizedCost),
          currency,
        },
      } as never);
      return;
    }

    setLoading(true);
    setError(null);

    const { error: saveError } = await saveMeeting({
      name: trimmedName,
      attendees: Number.parseInt(params.attendees ?? '6', 10),
      avg_salary: Number.parseFloat(params.avgSalary ?? '100000'),
      duration_minutes: Number.parseInt(params.durationMinutes ?? '60', 10),
      recurrence: params.recurrence as 'weekly' | 'monthly',
      currency,
      score,
      annualized_cost: annualizedCost,
      annualized_waste: annualizedWaste,
      risk: Number.parseFloat(params.risk ?? '0'),
      severity: (params.severity ?? 'mid') as Severity,
    });

    setLoading(false);

    if (saveError) {
      setError(saveError);
    } else {
      // Clear pending save ref on success
      pendingSaveRef.current = null;
      setSaved(true);
    }
  };

  if (saved) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center px-6 pb-10">
          <Text className="text-3xl font-bold text-gray-900">Saved</Text>
          <Text className="mt-3 text-base leading-6 text-gray-500">
            Your meeting is now tracked on your dashboard.
          </Text>

          <Pressable
            onPress={() => router.replace('/' as never)}
            className="mt-8 rounded-2xl bg-gray-900 px-5 py-4">
            <Text className="text-center text-base font-bold text-white">
              View Dashboard
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            className="mt-3 rounded-2xl border border-gray-300 px-5 py-4">
            <Text className="text-center text-base font-semibold text-gray-700">
              Done
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6 pb-10">
        <Text className="text-3xl font-bold text-gray-900">Save Meeting</Text>
        <Text className="mt-3 text-base leading-6 text-gray-500">
          Give this recurring meeting a name to track it on your dashboard.
        </Text>

        <View className="mt-8 rounded-2xl border border-gray-200 bg-white p-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Meeting Name
          </Text>
          <View className="mt-3 rounded-xl border border-gray-300 bg-white px-4 py-3">
            <TextInput
              value={name}
              onChangeText={setName}
              autoFocus
              placeholder="e.g., Weekly Standup"
              placeholderTextColor="#9ca3af"
              className="text-lg text-gray-900"
            />
          </View>
        </View>

        <View className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
          <PreviewRow label="Annualized Cost" value={formatMoney(annualizedCost, currency)} />
          <PreviewRow label="Annualized Waste" value={formatMoney(annualizedWaste, currency)} />
          <PreviewRow label="Quality Score" value={`${score}/100`} />
          <PreviewRow
            label="Recurrence"
            value={params.recurrence === 'weekly' ? 'Weekly' : 'Monthly'}
          />
        </View>

        {error ? (
          <Text className="mt-4 text-sm text-red-600">{error}</Text>
        ) : null}

        <Pressable
          onPress={handleSave}
          disabled={loading}
          className={`mt-8 rounded-2xl px-5 py-4 ${loading ? 'bg-gray-200' : 'bg-gray-900'}`}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-center text-base font-bold text-white">
              Save to Dashboard
            </Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.back()} className="mt-3 px-5 py-3">
          <Text className="text-center text-base text-gray-500">Cancel</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="mt-3 flex-row items-center justify-between">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-base font-bold text-gray-900">{value}</Text>
    </View>
  );
}
