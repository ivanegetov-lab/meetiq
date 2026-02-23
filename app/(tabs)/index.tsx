import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { useMeetings } from '@/hooks/useMeetings';
import { formatMoney, type Currency } from '@/lib/calculations';
import type { MeetingRow } from '@/lib/types';

export default function HomeScreen() {
  const { session, loading: authLoading, signOut } = useAuth();

  // Show loading while auth is resolving
  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6b7280" />
        </View>
      </SafeAreaView>
    );
  }

  // Not authenticated — show landing page
  if (!session) {
    return <LandingView />;
  }

  // Authenticated — show dashboard
  return <DashboardView signOut={signOut} />;
}

/* ─── Landing (unauthenticated) ─── */
function LandingView() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6 pb-10">
        <Text className="text-4xl font-extrabold leading-tight text-gray-900">
          Your meetings aren't free.
        </Text>
        <Text className="mt-4 text-base leading-6 text-gray-500">
          MeetIQ shows the real cost and waste of meetings in seconds.
        </Text>
        <Link href={'/(tabs)/calculate' as never} asChild>
          <Pressable className="mt-10 rounded-2xl bg-gray-900 px-5 py-4">
            <Text className="text-center text-base font-bold text-white">Calculate</Text>
          </Pressable>
        </Link>
        <Pressable
          onPress={() => router.push('/login' as never)}
          className="mt-4 rounded-2xl border border-gray-300 px-5 py-4">
          <Text className="text-center text-base font-semibold text-gray-700">Sign In</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/* ─── Dashboard (authenticated) ─── */
function DashboardView({ signOut }: { signOut: () => Promise<void> }) {
  const { meetings, loading, error, deleteMeeting, refetch } = useMeetings();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleDelete = (meeting: MeetingRow) => {
    Alert.alert('Delete Meeting', `Remove "${meeting.name}" from your dashboard?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMeeting(meeting.id),
      },
    ]);
  };

  const handleEdit = (meeting: MeetingRow) => {
    router.push({
      pathname: '/(tabs)/calculate',
      params: {
        attendees: String(meeting.attendees),
        avgSalary: String(meeting.avg_salary),
        durationMinutes: String(meeting.duration_minutes),
        recurrence: meeting.recurrence,
        currency: meeting.currency,
        editMeetingId: meeting.id,
        editMeetingName: meeting.name,
      },
    } as never);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Derived stats
  const totalAnnualCost = meetings.reduce((sum, m) => sum + m.annualized_cost, 0);
  const totalAnnualWaste = meetings.reduce((sum, m) => sum + m.annualized_waste, 0);
  const meetingCount = meetings.length;
  const highestCost = meetings.length > 0 ? meetings[0] : null;
  const displayCurrency: Currency = meetings.length > 0 ? meetings[0].currency : 'USD';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-6"
        contentContainerClassName="pb-10 pt-8"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6b7280" />
        }>
        <Text className="text-3xl font-bold text-gray-900">Your Meeting Tax</Text>
        <Text className="mt-2 text-base leading-6 text-gray-500">
          Recurring meetings you're tracking.
        </Text>

        {/* Summary Cards */}
        <View className="mt-6 flex-row gap-3">
          <View className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="text-xs uppercase tracking-wide text-gray-500">Annual Tax</Text>
            <Text className="mt-2 text-2xl font-extrabold text-gray-900">
              {formatMoney(totalAnnualCost, displayCurrency)}
            </Text>
          </View>
          <View className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="text-xs uppercase tracking-wide text-gray-500">Annual Waste</Text>
            <Text className="mt-2 text-2xl font-extrabold text-red-600">
              {formatMoney(totalAnnualWaste, displayCurrency)}
            </Text>
          </View>
        </View>

        <View className="mt-3 flex-row gap-3">
          <View className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="text-xs uppercase tracking-wide text-gray-500">Meetings</Text>
            <Text className="mt-2 text-2xl font-extrabold text-gray-900">{meetingCount}</Text>
          </View>
          <View className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="text-xs uppercase tracking-wide text-gray-500">Highest Cost</Text>
            {highestCost ? (
              <>
                <Text className="mt-2 text-lg font-bold text-gray-900" numberOfLines={1}>
                  {formatMoney(highestCost.annualized_cost, highestCost.currency)}
                </Text>
                <Text className="mt-1 text-xs text-gray-400" numberOfLines={1}>
                  {highestCost.name}
                </Text>
              </>
            ) : (
              <Text className="mt-2 text-lg font-bold text-gray-400">—</Text>
            )}
          </View>
        </View>

        {/* Error */}
        {error ? <Text className="mt-4 text-sm text-red-600">{error}</Text> : null}

        {/* Meeting List */}
        {loading && meetings.length === 0 ? (
          <View className="mt-8 items-center">
            <ActivityIndicator size="small" color="#9ca3af" />
          </View>
        ) : meetings.length === 0 ? (
          <View className="mt-8 items-center rounded-2xl border border-gray-200 bg-white p-8">
            <Text className="text-lg font-bold text-gray-900">No meetings saved yet</Text>
            <Text className="mt-2 text-center text-base text-gray-500">
              Calculate a recurring meeting to start tracking your meeting tax.
            </Text>
            <Link href={'/(tabs)/calculate' as never} asChild>
              <Pressable className="mt-6 rounded-2xl bg-gray-900 px-6 py-3">
                <Text className="text-center text-base font-bold text-white">Calculate</Text>
              </Pressable>
            </Link>
          </View>
        ) : (
          <View className="mt-6">
            <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Your Meetings
            </Text>
            {meetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onDelete={() => handleDelete(meeting)}
                onEdit={() => handleEdit(meeting)}
              />
            ))}
          </View>
        )}

        {/* Actions */}
        <Link href={'/(tabs)/calculate' as never} asChild>
          <Pressable className="mt-8 rounded-2xl bg-gray-900 px-5 py-4">
            <Text className="text-center text-base font-bold text-white">New Calculation</Text>
          </Pressable>
        </Link>

        <Pressable onPress={handleSignOut} className="mt-6 px-5 py-3">
          <Text className="text-center text-base text-red-600">Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Meeting Card ─── */
function MeetingCard({
  meeting,
  onDelete,
  onEdit,
}: {
  meeting: MeetingRow;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const severityColor =
    meeting.severity === 'good'
      ? 'bg-emerald-400'
      : meeting.severity === 'mid'
        ? 'bg-amber-400'
        : 'bg-red-400';

  return (
    <View className="mb-3 rounded-2xl border border-gray-200 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-2">
          <View className={`h-2.5 w-2.5 rounded-full ${severityColor}`} />
          <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
            {meeting.name}
          </Text>
        </View>
        <View className="rounded-lg bg-gray-100 px-2 py-1">
          <Text className="text-xs font-semibold uppercase text-gray-500">
            {meeting.recurrence}
          </Text>
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <View>
          <Text className="text-xs text-gray-400">Annualized Cost</Text>
          <Text className="mt-1 text-lg font-bold text-gray-900">
            {formatMoney(meeting.annualized_cost, meeting.currency)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-gray-400">Quality</Text>
          <Text className="mt-1 text-lg font-bold text-gray-700">{meeting.score}/100</Text>
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <Pressable onPress={onEdit} className="px-2 py-1">
          <Text className="text-sm font-semibold text-gray-500">Edit</Text>
        </Pressable>
        <Pressable onPress={onDelete} className="px-2 py-1">
          <Text className="text-sm text-red-600">Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}
