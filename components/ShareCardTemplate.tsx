import React from 'react';
import { Text, View } from 'react-native';

import ShareRiskBand from '@/components/ShareRiskBand';
import { formatMoney, type Currency, type Recurrence } from '@/lib/calculations';
import { type Severity } from '@/lib/risk';

type ShareCardTemplateProps = {
  currency: Currency;
  annualizedCost: number;
  annualizedWaste: number;
  costPerMeeting: number;
  score: number;
  severity: Severity;
  risk: number;
  recurrence?: Recurrence;
};

export default function ShareCardTemplate({
  currency,
  annualizedCost,
  annualizedWaste,
  costPerMeeting,
  score,
  severity,
  risk,
  recurrence,
}: ShareCardTemplateProps) {
  const wasteColor =
    severity === 'good' ? '#34d399' : severity === 'mid' ? '#fcd34d' : '#f87171';

  const recurrenceLabel =
    recurrence === 'weekly' ? 'Weekly meeting' : recurrence === 'monthly' ? 'Monthly meeting' : 'One-time meeting';

  return (
    <View
      style={{ width: 1080, height: 1080, borderRadius: 48, overflow: 'hidden' }}
      className="border border-zinc-800 bg-zinc-950">
      <View style={{ flex: 1, padding: 72, justifyContent: 'space-between' }}>
        {/* Header: MEETIQ branding + subtitle */}
        <View>
          <Text
            style={{ fontSize: 28, lineHeight: 34, letterSpacing: 6 }}
            className="font-semibold uppercase text-zinc-400">
            MeetIQ
          </Text>
          <Text
            style={{ fontSize: 44, lineHeight: 52, marginTop: 8 }}
            className="font-bold text-zinc-200">
            Meeting Cost Impact
          </Text>
        </View>

        {/* Hero: Annualized Cost */}
        <View>
          <Text
            style={{ fontSize: 28, lineHeight: 34, letterSpacing: 4 }}
            className="font-semibold uppercase text-zinc-500">
            Annualized Cost
          </Text>
          <Text
            style={{ fontSize: 136, lineHeight: 148, marginTop: 12 }}
            className="font-extrabold text-white">
            {formatMoney(annualizedCost, currency)}
          </Text>
        </View>

        {/* Stat Cards Row */}
        <View style={{ flexDirection: 'row', gap: 24 }}>
          <View
            style={{ flex: 1, borderRadius: 24, padding: 28 }}
            className="border border-zinc-800 bg-zinc-900">
            <Text
              style={{ fontSize: 22, lineHeight: 28, letterSpacing: 2 }}
              className="font-semibold uppercase text-zinc-500">
              Cost / Meeting
            </Text>
            <Text
              style={{ fontSize: 44, lineHeight: 52, marginTop: 12 }}
              className="font-extrabold text-white">
              {formatMoney(costPerMeeting, currency)}
            </Text>
          </View>

          <View
            style={{ flex: 1, borderRadius: 24, padding: 28 }}
            className="border border-zinc-800 bg-zinc-900">
            <Text
              style={{ fontSize: 22, lineHeight: 28, letterSpacing: 2 }}
              className="font-semibold uppercase text-zinc-500">
              Quality Score
            </Text>
            <Text
              style={{ fontSize: 44, lineHeight: 52, marginTop: 12 }}
              className="font-extrabold text-white">
              {Math.round(score)}/100
            </Text>
          </View>
        </View>

        {/* Waste */}
        <View>
          <Text
            style={{ fontSize: 28, lineHeight: 34, letterSpacing: 4 }}
            className="font-semibold uppercase text-zinc-500">
            Est. Annualized Waste
          </Text>
          <Text
            style={{ fontSize: 80, lineHeight: 92, marginTop: 12 }}
            className="font-extrabold">
            <Text style={{ color: wasteColor }}>{formatMoney(annualizedWaste, currency)}</Text>
          </Text>
        </View>

        {/* Risk Band */}
        <View>
          <Text
            style={{ fontSize: 24, lineHeight: 30, letterSpacing: 3, marginBottom: 16 }}
            className="font-semibold uppercase text-zinc-500">
            Meeting Waste Risk
          </Text>
          <ShareRiskBand risk={risk} severity={severity} />
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-between">
          <Text
            style={{ fontSize: 26, lineHeight: 32 }}
            className="text-zinc-500">
            {recurrenceLabel}
          </Text>
          <Text
            style={{ fontSize: 26, lineHeight: 32 }}
            className="text-zinc-600">
            meetiq.app
          </Text>
        </View>
      </View>
    </View>
  );
}
