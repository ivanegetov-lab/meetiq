import React from 'react';
import { View, Text } from 'react-native';
import { type Severity } from '@/lib/risk';

type ShareRiskBandProps = {
  risk: number;
  severity: Severity;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default function ShareRiskBand({ risk, severity }: ShareRiskBandProps) {
  const [barWidth, setBarWidth] = React.useState(0);
  const barHeight = 26;
  const markerRadius = 15;
  const clampedRisk = clamp(risk, 0, 1);
  const usable = Math.max(0, barWidth - markerRadius * 2);
  const markerLeft = clamp(markerRadius + clampedRisk * usable - markerRadius, 0, Math.max(0, barWidth - markerRadius * 2));
  const markerTop = Math.max(0, barHeight / 2 - markerRadius);

  const riskText = severity === 'good' ? 'Low risk' : severity === 'mid' ? 'Medium risk' : 'High risk';
  const riskColor =
    severity === 'good' ? 'text-emerald-400' : severity === 'mid' ? 'text-amber-300' : 'text-red-400';

  return (
    <View className="w-full">
      <View
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
        style={{ height: barHeight }}
        className="relative w-full overflow-hidden rounded-full">
        <View className="h-full flex-row">
          <View className="flex-1 bg-emerald-500" />
          <View className="flex-1 bg-amber-400" />
          <View className="flex-1 bg-red-500" />
        </View>
        {barWidth > 0 ? (
          <View
            style={{
              position: 'absolute',
              left: markerLeft,
              top: markerTop,
              width: markerRadius * 2,
              height: markerRadius * 2,
              borderRadius: markerRadius,
              backgroundColor: '#ffffff',
              borderWidth: 2,
              borderColor: '#18181b',
            }}
          />
        ) : null}
      </View>
      <Text className={`mt-3 text-base font-semibold ${riskColor}`}>{riskText}</Text>
    </View>
  );
}
