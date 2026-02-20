import React from 'react';
import { View, Text } from 'react-native';

type HeatMapProps = {
  score: number;
  cost: number;
  qualityThreshold?: number;
  minCostThreshold?: number;
  maxCostThreshold?: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default function HeatMap({
  score,
  cost,
  qualityThreshold = 70,
  minCostThreshold = 1000,
  maxCostThreshold = 5000,
}: HeatMapProps) {
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const pad = 12;

  const raw = cost * 1.25;
  const costThreshold = Math.max(minCostThreshold, Math.min(maxCostThreshold, raw));
  const costCap = costThreshold * 2;

  const xPercent = clamp(score / 100, 0, 1);
  const yPercent = clamp(cost / costCap, 0, 1);
  const dotLeft = pad + xPercent * Math.max(0, size.width - pad * 2);
  const dotTop = pad + (1 - yPercent) * Math.max(0, size.height - pad * 2);

  const verticalDividerX = clamp(qualityThreshold / 100, 0, 1) * size.width;
  const horizontalDividerY = (1 - costThreshold / costCap) * size.height;

  const verticalDividerPercent = clamp(qualityThreshold / 100, 0, 1) * 100;
  const horizontalDividerPercent = (1 - costThreshold / costCap) * 100;

  return (
    <View className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <Text className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Impact Heat Map</Text>
      <View className="mt-4 flex-row">
        <View className="mr-3 h-60 items-start justify-between py-1">
          <Text className="text-xs text-zinc-400">High Cost</Text>
          <Text className="text-xs text-zinc-400">Low Cost</Text>
        </View>

        <View className="flex-1">
          <View
            className="h-60 overflow-hidden rounded-xl border border-zinc-700"
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setSize({ width, height });
            }}>
            <View
              className="absolute left-0 top-0 bg-red-500/45"
              style={{ width: `${verticalDividerPercent}%`, height: `${horizontalDividerPercent}%` }}
            />
            <View
              className="absolute right-0 top-0 bg-amber-400/45"
              style={{ width: `${100 - verticalDividerPercent}%`, height: `${horizontalDividerPercent}%` }}
            />
            <View
              className="absolute bottom-0 left-0 bg-orange-400/45"
              style={{ width: `${verticalDividerPercent}%`, height: `${100 - horizontalDividerPercent}%` }}
            />
            <View
              className="absolute bottom-0 right-0 bg-emerald-500/45"
              style={{ width: `${100 - verticalDividerPercent}%`, height: `${100 - horizontalDividerPercent}%` }}
            />

            <View
              className="absolute top-0 h-full w-[1px] bg-zinc-100/35"
              style={{ left: verticalDividerX }}
            />
            <View
              className="absolute left-0 h-[1px] w-full bg-zinc-100/35"
              style={{ top: horizontalDividerY }}
            />

            {size.width > 0 && size.height > 0 ? (
              <View
                className="absolute h-4 w-4 rounded-full border border-zinc-100 bg-white"
                style={{
                  left: dotLeft - 8,
                  top: dotTop - 8,
                  shadowColor: '#ffffff',
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 1 },
                  elevation: 3,
                }}
              />
            ) : null}
          </View>

          <View className="mt-2 px-1">
            <View className="flex-row justify-between">
              <Text className="text-xs text-zinc-400">Low Quality</Text>
              <Text className="text-xs text-zinc-400">High Quality</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
