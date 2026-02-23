import { Stack } from 'expo-router';

export default function CalculateLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#111827',
        contentStyle: { backgroundColor: '#ffffff' },
      }}>
      <Stack.Screen name="index" options={{ title: 'Calculate' }} />
      <Stack.Screen name="quality" options={{ title: 'Quality' }} />
      <Stack.Screen name="results" options={{ title: 'Results' }} />
      <Stack.Screen name="share" options={{ title: 'Share' }} />
    </Stack>
  );
}
