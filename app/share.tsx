import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';

import ShareCardTemplate from '@/components/ShareCardTemplate';
import { type Currency } from '@/lib/calculations';
import { type Severity } from '@/lib/risk';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ShareScreen() {
  const { width, height } = useWindowDimensions();
  const actionBarHeight = 96;
  const availableWidth = width - 24 * 2;
  const availableHeight = height - actionBarHeight - 24;
  const scale = Math.min(availableWidth / 1080, availableHeight / 1080);

  const captureRef = React.useRef<ViewShot>(null);
  const [shareMessage, setShareMessage] = React.useState<string | null>(null);

  const params = useLocalSearchParams<{
    currency?: Currency;
    annualizedCost?: string;
    annualizedWaste?: string;
    costPerMeeting?: string;
    score?: string;
    severity?: Severity;
    risk?: string;
  }>();

  const toNumber = (value: string | undefined, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const currency: Currency = params.currency === 'EUR' ? 'EUR' : 'USD';
  const annualizedCost = toNumber(params.annualizedCost, 0);
  const annualizedWaste = toNumber(params.annualizedWaste, 0);
  const costPerMeeting = toNumber(params.costPerMeeting, 0);
  const score = Math.max(0, Math.min(100, toNumber(params.score, 0)));
  const risk = Math.max(0, Math.min(1, toNumber(params.risk, 0)));
  const severity: Severity =
    params.severity === 'severe' || params.severity === 'mid' || params.severity === 'good'
      ? params.severity
      : 'mid';

  const onShareImage = async () => {
    setShareMessage(null);

    try {
      await wait(200);
      const uri = await captureRef.current?.capture?.();
      if (!uri) {
        Alert.alert('Capture failed', 'No image was captured.');
        return;
      }

      const sharingAvailable = await Sharing.isAvailableAsync();
      if (sharingAvailable) {
        await Sharing.shareAsync(uri);
        return;
      }

      setShareMessage(`Sharing is unavailable on this device. Captured image URI: ${uri}`);
    } catch {
      setShareMessage('Could not share image. Take a screenshot to share instead.');
    }
  };

  const onSaveImage = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Allow photo access to save images.');
        return;
      }

      await wait(200);
      const uri = await captureRef.current?.capture?.();
      if (!uri) {
        Alert.alert('Save failed', 'No image captured.');
        return;
      }

      // First save an asset to the library, then try to place it in a dedicated album.
      const asset = await MediaLibrary.createAssetAsync(uri);
      const albumName = 'MeetIQ';

      try {
        const album = await MediaLibrary.getAlbumAsync(albumName);
        if (album) {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, true);
        } else {
          await MediaLibrary.createAlbumAsync(albumName, asset, true);
        }
        Alert.alert('Saved', 'Saved to your gallery (MeetIQ album).');
      } catch {
        // Album assignment can fail on some Android configurations; keep the successful library save.
        Alert.alert('Saved', 'Saved to your gallery.');
      }
    } catch {
      try {
        await wait(100);
        const uri = await captureRef.current?.capture?.();
        if (uri) {
          await MediaLibrary.saveToLibraryAsync(uri);
          Alert.alert('Saved', 'Saved to your gallery.');
          return;
        }
      } catch {
        // Fall through to final error alert.
      }
      Alert.alert('Save failed', 'Could not save image to gallery.');
    }
  };

  const previewInnerStyle = {
    width: 1080,
    height: 1080,
    transform: [{ scale }],
    transformOrigin: 'top left',
  } as any;

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView className="flex-1 px-6" contentContainerClassName="pt-6" contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ width: 1080 * scale, height: 1080 * scale, alignSelf: 'center' }}>
          <View style={previewInnerStyle}>
            <ShareCardTemplate
              currency={currency}
              annualizedCost={annualizedCost}
              annualizedWaste={annualizedWaste}
              costPerMeeting={costPerMeeting}
              score={score}
              severity={severity}
              risk={risk}
            />
          </View>
        </View>

        <Text className="mt-5 text-center text-sm text-zinc-400">Take a screenshot to share on LinkedIn</Text>
        {shareMessage ? <Text className="mt-2 text-center text-xs leading-5 text-zinc-500">{shareMessage}</Text> : null}
      </ScrollView>

      <View style={{ position: 'absolute', left: -2000, top: 0 }}>
        <ViewShot
          ref={captureRef}
          {...({ collapsable: false } as Record<string, unknown>)}
          options={{ format: 'png', quality: 1, result: 'tmpfile' }}>
          <ShareCardTemplate
            currency={currency}
            annualizedCost={annualizedCost}
            annualizedWaste={annualizedWaste}
            costPerMeeting={costPerMeeting}
            score={score}
            severity={severity}
            risk={risk}
          />
        </ViewShot>
      </View>

      <View className="border-t border-zinc-800 bg-zinc-950 px-6 pb-6 pt-4">
        <Pressable onPress={onShareImage} className="rounded-2xl bg-white px-5 py-4">
          <Text className="text-center text-base font-bold text-zinc-950">Share Image</Text>
        </Pressable>

        <Pressable onPress={onSaveImage} className="mt-3 rounded-2xl border border-zinc-700 px-5 py-4">
          <Text className="text-center text-base font-semibold text-zinc-200">Save Image</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/results')} className="rounded-2xl border border-zinc-700 px-5 py-4">
          <Text className="text-center text-base font-semibold text-zinc-200">Back to Results</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/calculate')} className="mt-3 rounded-2xl bg-white px-5 py-4">
          <Text className="text-center text-base font-bold text-zinc-950">New Calculation</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
