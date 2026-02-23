import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { formatMoney, type Currency } from '@/lib/calculations';
import { FREE_MEETING_LIMIT } from '@/lib/limits';

export default function PaywallScreen() {
  const params = useLocalSearchParams<{
    totalCost?: string;
    currency?: string;
  }>();

  const totalCost = Number.parseFloat(params.totalCost ?? '0');
  const currency = (params.currency ?? 'USD') as Currency;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6 pb-10">
        <Text className="text-3xl font-bold text-gray-900">
          You've hit your limit
        </Text>

        {totalCost > 0 ? (
          <Text className="mt-4 text-lg leading-7 text-gray-500">
            You're tracking{' '}
            <Text className="font-bold text-gray-900">
              {formatMoney(totalCost, currency)}
            </Text>{' '}
            in recurring meeting cost.
          </Text>
        ) : null}

        <Text className="mt-4 text-base leading-6 text-gray-500">
          The free plan allows {FREE_MEETING_LIMIT} recurring meetings.
          Upgrade to track your full meeting tax.
        </Text>

        <View className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <Text className="text-lg font-bold text-gray-900">MeetIQ Pro</Text>
          <Text className="mt-2 text-base leading-6 text-gray-500">
            Unlimited recurring meetings{'\n'}
            Full meeting tax tracking{'\n'}
            Weekly summary email
          </Text>
          <Text className="mt-4 text-sm font-semibold text-amber-600">
            Coming soon
          </Text>
        </View>

        <Pressable
          onPress={() => router.back()}
          className="mt-8 rounded-2xl border border-gray-300 px-5 py-4">
          <Text className="text-center text-base font-semibold text-gray-700">
            Dismiss
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
