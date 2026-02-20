import React from 'react';
import { Text, View } from 'react-native';
import { type Severity } from '@/lib/risk';

type RiskBandProps = {
  risk: number;
  severity: Severity;
  label?: string;
  compact?: boolean;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default function RiskBand({
  risk,
  severity,
  label = 'Meeting Waste Risk',
  compact = false,
}: RiskBandProps) {
  const [barWidth, setBarWidth] = React.useState(0);
  const r = compact ? 6 : 8;
  const markerSize = r * 2;
  const barHeight = compact ? 12 : 16;
  const clampedRisk = clamp(risk, 0, 1);
  const usableWidth = Math.max(0, barWidth - 2 * r);
  const x = r + clampedRisk * usableWidth;
  const markerLeft = x - r;
  const markerTop = Math.max(0, barHeight / 2 - r);

  const riskText = severity === 'good' ? 'Low risk' : severity === 'mid' ? 'Medium risk' : 'High risk';
  const riskTextColor =
    severity === 'good' ? 'text-emerald-400' : severity === 'mid' ? 'text-amber-300' : 'text-red-400';

  const containerClass = compact
    ? 'rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3'
    : 'mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4';
  const barClass = compact ? 'h-3 flex-row overflow-hidden rounded-full border border-zinc-700' : 'h-4 flex-row overflow-hidden rounded-full border border-zinc-700';
  const titleClass = compact
    ? 'text-xs font-semibold uppercase tracking-wide text-zinc-400'
    : 'text-sm font-semibold uppercase tracking-wide text-zinc-400';
  const badgeClass = compact ? `text-xs font-bold ${riskTextColor}` : `text-sm font-bold ${riskTextColor}`;

  return (
    <View className={containerClass}>
      {compact ? (
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className={titleClass}>{label}</Text>
            <Text className={badgeClass}>{riskText}</Text>
          </View>

          <View
            className="relative mt-2"
            onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}>
            <View className={barClass}>
              <View className="flex-1 bg-emerald-500" />
              <View className="flex-1 bg-amber-400" />
              <View className="flex-1 bg-red-500" />
            </View>
            {barWidth > 0 ? (
              <View
                className="absolute rounded-full border-2 border-zinc-900 bg-white"
                style={{
                  width: markerSize,
                  height: markerSize,
                  left: markerLeft,
                  top: markerTop,
                }}
              />
            ) : null}
          </View>
        </View>
      ) : (
        <>
          <View className="flex-row items-center justify-between">
            <Text className={titleClass}>{label}</Text>
            <Text className={badgeClass}>{riskText}</Text>
          </View>

          <View
            className="relative mt-4"
            onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}>
            <View className={barClass}>
              <View className="flex-1 bg-emerald-500" />
              <View className="flex-1 bg-amber-400" />
              <View className="flex-1 bg-red-500" />
            </View>
            {barWidth > 0 ? (
              <View
                className="absolute rounded-full border-2 border-zinc-900 bg-white"
                style={{
                  width: markerSize,
                  height: markerSize,
                  left: markerLeft,
                  top: markerTop,
                }}
              />
            ) : null}
          </View>

          <View className="mt-2 flex-row justify-between px-1">
            <Text className="text-xs text-zinc-400">Low</Text>
            <Text className="text-xs text-zinc-400">Medium</Text>
            <Text className="text-xs text-zinc-400">High</Text>
          </View>
          <Text className="mt-2 text-xs text-zinc-500">Position within zone reflects annualized waste.</Text>
        </>
      )}
    </View>
  );
}
