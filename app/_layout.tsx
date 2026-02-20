import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#09090b' },
          headerTintColor: '#ffffff',
          contentStyle: { backgroundColor: '#09090b' },
        }}
      />
    </>
  );
}
