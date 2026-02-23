import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const { session, sendOtp, verifyOtp, pendingSaveRef } = useAuth();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // If user becomes authenticated, redirect to pending save or home.
  useEffect(() => {
    if (!session) return;

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
  }, [session]);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSendCode = async () => {
    if (!isValidEmail || loading) return;
    setLoading(true);
    setError(null);

    const { error: otpError } = await sendOtp(email.trim());

    setLoading(false);

    if (otpError) {
      setError(otpError.message);
    } else {
      setStep('code');
      setCooldown(60);
    }
  };

  const handleVerifyCode = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode || loading) return;
    setLoading(true);
    setError(null);

    const { error: verifyError } = await verifyOtp(email.trim(), trimmedCode);

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message);
    }
    // On success, the onAuthStateChange listener in AuthContext
    // sets the session, which triggers the useEffect redirect above.
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setCode('');
    setError(null);
    await handleSendCode();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6 pb-10">
        {step === 'email' ? (
          <>
            <Text className="text-3xl font-bold text-gray-900">Sign in to MeetIQ</Text>
            <Text className="mt-3 text-base leading-6 text-gray-500">
              Enter your email and we'll send you a sign-in code.
            </Text>

            <View className="mt-8 rounded-2xl border border-gray-200 bg-white p-4">
              <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Email
              </Text>
              <View className="mt-3 rounded-xl border border-gray-300 bg-white px-4 py-3">
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="you@company.com"
                  placeholderTextColor="#9ca3af"
                  className="text-lg text-gray-900"
                />
              </View>
            </View>

            {error ? (
              <Text className="mt-4 text-sm text-red-600">{error}</Text>
            ) : null}

            <Pressable
              onPress={handleSendCode}
              disabled={!isValidEmail || loading}
              className={`mt-8 rounded-2xl px-5 py-4 ${
                !isValidEmail || loading ? 'bg-gray-200' : 'bg-gray-900'
              }`}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text
                  className={`text-center text-base font-bold ${
                    !isValidEmail ? 'text-gray-400' : 'text-white'
                  }`}>
                  Send Code
                </Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <Text className="text-3xl font-bold text-gray-900">Enter your code</Text>
            <Text className="mt-3 text-base leading-6 text-gray-500">
              We sent a code to
            </Text>
            <Text className="mt-1 text-lg font-semibold text-gray-900">{email}</Text>

            <View className="mt-8 rounded-2xl border border-gray-200 bg-white p-4">
              <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Code
              </Text>
              <View className="mt-3 rounded-xl border border-gray-300 bg-white px-4 py-3">
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  autoFocus
                  maxLength={8}
                  placeholder="00000000"
                  placeholderTextColor="#9ca3af"
                  className="text-center text-3xl font-bold tracking-widest text-gray-900"
                />
              </View>
            </View>

            {error ? (
              <Text className="mt-4 text-sm text-red-600">{error}</Text>
            ) : null}

            <Pressable
              onPress={handleVerifyCode}
              disabled={code.trim().length < 6 || code.trim().length > 8 || loading}
              className={`mt-8 rounded-2xl px-5 py-4 ${
                code.trim().length < 6 || code.trim().length > 8 || loading ? 'bg-gray-200' : 'bg-gray-900'
              }`}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text
                  className={`text-center text-base font-bold ${
                    code.trim().length < 6 || code.trim().length > 8 ? 'text-gray-400' : 'text-white'
                  }`}>
                  Verify
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={handleResend}
              disabled={cooldown > 0 || loading}
              className={`mt-4 rounded-2xl border px-5 py-4 ${
                cooldown > 0 ? 'border-gray-200' : 'border-gray-300'
              }`}>
              <Text
                className={`text-center text-base font-semibold ${
                  cooldown > 0 ? 'text-gray-400' : 'text-gray-700'
                }`}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setStep('email');
                setCode('');
                setError(null);
              }}
              className="mt-4 px-5 py-3">
              <Text className="text-center text-base text-gray-500">Use a different email</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
