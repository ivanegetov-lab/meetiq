import '../global.css';

import { useCallback } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { loading } = useAuth();

  const onLayoutReady = useCallback(async () => {
    if (!loading) {
      await SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutReady}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#111827',
          contentStyle: { backgroundColor: '#ffffff' },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Sign In' }} />
        <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
        <Stack.Screen
          name="save-meeting"
          options={{ presentation: 'modal', title: 'Save Meeting' }}
        />
        <Stack.Screen
          name="paywall"
          options={{ presentation: 'modal', title: 'MeetIQ Pro' }}
        />
      </Stack>
    </View>
  );
}
