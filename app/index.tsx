import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <View className="flex-1 justify-center px-6 pb-10">
        <Text className="text-4xl font-extrabold leading-tight text-white">
          Your meetings aren’t free.
        </Text>
        <Text className="mt-4 text-base leading-6 text-zinc-300">
          MeetIQ shows the real cost and waste of meetings in seconds.
        </Text>
        <Link href="/calculate" asChild>
          <Pressable className="mt-10 rounded-2xl bg-white px-5 py-4">
            <Text className="text-center text-base font-bold text-zinc-950">Calculate</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
