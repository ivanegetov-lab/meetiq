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

  // Scaled up for 1080×1080 share card
  const barHeight = 44;
  const markerDiameter = 52;
  const markerRadius = markerDiameter / 2;
  const containerHeight = markerDiameter + 4; // extra space so marker isn't clipped

  const clampedRisk = clamp(risk, 0, 1);
  const usable = Math.max(0, barWidth - markerDiameter);
  const markerLeft = clampedRisk * usable;

  // Center the bar and marker vertically within the container
  const barTop = (containerHeight - barHeight) / 2;
  const markerTop = (containerHeight - markerDiameter) / 2;

  const riskText = severity === 'good' ? 'Low risk' : severity === 'mid' ? 'Medium risk' : 'High risk';
  const riskTextColor =
    severity === 'good' ? '#34d399' : severity === 'mid' ? '#fcd34d' : '#f87171';

  return (
    <View className="w-full">
      <View
        style={{ height: containerHeight }}
        className="relative"
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}>
        {/* Gradient bar */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: barTop,
            height: barHeight,
            borderRadius: barHeight / 2,
            overflow: 'hidden',
          }}>
          <View className="h-full flex-row">
            <View className="flex-1 bg-emerald-500" />
            <View className="flex-1 bg-amber-400" />
            <View className="flex-1 bg-red-500" />
          </View>
        </View>

        {/* Position marker */}
        {barWidth > 0 ? (
          <View
            style={{
              position: 'absolute',
              left: markerLeft,
              top: markerTop,
              width: markerDiameter,
              height: markerDiameter,
              borderRadius: markerRadius,
              backgroundColor: '#ffffff',
              borderWidth: 3,
              borderColor: '#18181b',
            }}
          />
        ) : null}
      </View>

      {/* Risk label — large for 1080px card */}
      <Text
        style={{ fontSize: 32, lineHeight: 40, marginTop: 16, color: riskTextColor }}
        className="font-bold">
        {riskText}
      </Text>
    </View>
  );
}
