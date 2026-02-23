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
    severity === 'good' ? 'text-emerald-600' : severity === 'mid' ? 'text-amber-600' : 'text-red-600';

  const containerClass = compact
    ? 'rounded-xl border border-gray-200 bg-white px-3 py-3'
    : 'mt-6 rounded-2xl border border-gray-200 bg-white p-4';
  const barClass = compact ? 'h-3 flex-row overflow-hidden rounded-full border border-gray-300' : 'h-4 flex-row overflow-hidden rounded-full border border-gray-300';
  const titleClass = compact
    ? 'text-xs font-semibold uppercase tracking-wide text-gray-500'
    : 'text-sm font-semibold uppercase tracking-wide text-gray-500';
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
                style={{
                  position: 'absolute',
                  width: markerSize,
                  height: markerSize,
                  left: markerLeft,
                  top: markerTop,
                  borderRadius: markerSize / 2,
                  backgroundColor: '#ffffff',
                  borderWidth: 2,
                  borderColor: '#374151',
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 3,
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
                style={{
                  position: 'absolute',
                  width: markerSize,
                  height: markerSize,
                  left: markerLeft,
                  top: markerTop,
                  borderRadius: markerSize / 2,
                  backgroundColor: '#ffffff',
                  borderWidth: 2,
                  borderColor: '#374151',
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 3,
                }}
              />
            ) : null}
          </View>

          <View className="mt-2 flex-row justify-between px-1">
            <Text className="text-xs text-gray-400">Low</Text>
            <Text className="text-xs text-gray-400">Medium</Text>
            <Text className="text-xs text-gray-400">High</Text>
          </View>
          <Text className="mt-2 text-xs text-gray-400">Position within zone reflects annualized waste.</Text>
        </>
      )}
    </View>
  );
}
