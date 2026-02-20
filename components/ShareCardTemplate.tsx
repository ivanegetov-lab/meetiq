import React from 'react';
import { Text, View } from 'react-native';

import ShareRiskBand from '@/components/ShareRiskBand';
import { formatMoney, type Currency } from '@/lib/calculations';
import { type Severity } from '@/lib/risk';

type ShareCardTemplateProps = {
  currency: Currency;
  annualizedCost: number;
  annualizedWaste: number;
  costPerMeeting: number;
  score: number;
  severity: Severity;
  risk: number;
};

export default function ShareCardTemplate({
  currency,
  annualizedCost,
  annualizedWaste,
  costPerMeeting,
  score,
  severity,
  risk,
}: ShareCardTemplateProps) {
  return (
    <View
      style={{ width: 1080, height: 1080, borderRadius: 48, overflow: 'hidden' }}
      className="border border-zinc-800 bg-zinc-950">
      <View className="h-full p-16">
        <View className="gap-10">
          <View>
            <Text style={{ fontSize: 28, lineHeight: 34 }} className="font-semibold uppercase tracking-[6px] text-zinc-400">
              MeetIQ
            </Text>
            <Text style={{ fontSize: 56, lineHeight: 64 }} className="mt-3 font-semibold text-zinc-100">
              Meeting Cost Impact
            </Text>
          </View>

          <View>
            <Text style={{ fontSize: 34, lineHeight: 38 }} className="uppercase tracking-wide text-zinc-400">
              ANNUALIZED COST
            </Text>
            <Text
              className="mt-4 font-extrabold text-white"
              style={{ fontSize: 146, lineHeight: 150 }}>
              {formatMoney(annualizedCost, currency)}
            </Text>
            <Text style={{ fontSize: 28, lineHeight: 34 }} className="mt-2 text-zinc-400">
              Per year based on recurrence
            </Text>
          </View>

          <View className="flex-row gap-5">
            <View className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <Text style={{ fontSize: 24, lineHeight: 30 }} className="uppercase tracking-wide text-zinc-500">
                Cost / meeting
              </Text>
              <Text style={{ fontSize: 48, lineHeight: 54 }} className="mt-2 font-bold text-zinc-100">
                {formatMoney(costPerMeeting, currency)}
              </Text>
            </View>
            <View className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <Text style={{ fontSize: 24, lineHeight: 30 }} className="uppercase tracking-wide text-zinc-500">
                Quality Score
              </Text>
              <Text style={{ fontSize: 48, lineHeight: 54 }} className="mt-2 font-bold text-zinc-100">
                {Math.round(score)}/100
              </Text>
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 34, lineHeight: 38 }} className="uppercase tracking-wide text-zinc-400">
              ESTIMATED ANNUALIZED WASTE
            </Text>
            <Text
              style={{ fontSize: 86, lineHeight: 92 }}
              className={`mt-4 font-extrabold ${
                severity === 'good' ? 'text-emerald-400' : severity === 'mid' ? 'text-amber-300' : 'text-red-400'
              }`}>
              {formatMoney(annualizedWaste, currency)}
            </Text>
          </View>

          <View className="gap-6">
            <Text style={{ fontSize: 34, lineHeight: 38 }} className="text-zinc-300 font-semibold tracking-wide uppercase">
              MEETING WASTE RISK
            </Text>
            <View style={{ height: 84, justifyContent: 'center', overflow: 'hidden' }}>
              <ShareRiskBand risk={risk} severity={severity} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
