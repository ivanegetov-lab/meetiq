import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallbackScreen() {
  const { pendingSaveRef } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Expo Router may pass the code as a search param
  const searchParams = useLocalSearchParams<{ code?: string }>();

  // Also listen for URL changes (covers Expo Go deep link handling)
  const incomingUrl = Linking.useURL();

  useEffect(() => {
    handleCallback();
  }, [incomingUrl]);

  const handleCallback = async () => {
    if (processing) return;
    setProcessing(true);

    try {
      // Try to get auth code from multiple sources
      let code: string | undefined;

      // 1. Check route search params (Expo Router parses these)
      if (searchParams.code) {
        code = searchParams.code;
      }

      // 2. Check the incoming URL from Linking.useURL()
      if (!code && incomingUrl) {
        const parsed = Linking.parse(incomingUrl);
        code = parsed.queryParams?.code as string | undefined;

        // Also check for hash fragments (implicit flow fallback)
        if (!code) {
          const hashMatch = incomingUrl.match(/access_token=([^&]+)/);
          if (hashMatch) {
            const refreshMatch = incomingUrl.match(/refresh_token=([^&]+)/);
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: hashMatch[1],
              refresh_token: refreshMatch?.[1] ?? '',
            });
            if (sessionError) throw sessionError;
            redirectAfterAuth();
            return;
          }
        }
      }

      // 3. Last resort: check initial URL
      if (!code) {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          const parsed = Linking.parse(initialUrl);
          code = parsed.queryParams?.code as string | undefined;
        }
      }

      if (!code) {
        setError('No authentication code found. Please try signing in again.');
        setProcessing(false);
        return;
      }

      // PKCE flow: exchange code for session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) throw exchangeError;

      redirectAfterAuth();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed.';
      setError(message);
      setProcessing(false);
    }
  };

  const redirectAfterAuth = () => {
    if (pendingSaveRef.current) {
      const params = pendingSaveRef.current;
      router.replace({
        pathname: '/save-meeting',
        params: {
          name: params.name,
          attendees: String(params.attendees),
          avgSalary: String(params.avg_salary),
          durationMinutes: String(params.duration_minutes),
          recurrence: params.recurrence,
          currency: params.currency,
          score: String(params.score),
          annualizedCost: String(params.annualized_cost),
          annualizedWaste: String(params.annualized_waste),
          risk: String(params.risk),
          severity: params.severity,
        },
      } as never);
    } else {
      router.replace('/');
    }
  };

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-bold text-gray-900">Sign-in failed</Text>
          <Text className="mt-3 text-center text-base leading-6 text-gray-500">
            {error}
          </Text>
          <Pressable
            onPress={() => router.replace('/login' as never)}
            className="mt-8 rounded-2xl bg-gray-900 px-8 py-4">
            <Text className="text-center text-base font-bold text-white">
              Try Again
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6b7280" />
        <Text className="mt-4 text-base text-gray-500">Signing you in...</Text>
      </View>
    </SafeAreaView>
  );
}
