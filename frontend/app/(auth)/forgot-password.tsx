import { CustomButton } from '@/components/common/CustomButton';
import { useForgotPassword } from '@/hooks/useAuth';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      await forgotPassword(email.trim().toLowerCase());
      
      Alert.alert(
        'Code Sent',
        'We\'ve sent a password reset code to your email.',
        [
          {
            text: 'OK',
            onPress: () => router.push({
              pathname: '/reset-password',
              params: { email: email.trim().toLowerCase() }
            })
          }
        ]
      );
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      if (error.code === 'UserNotFoundException') {
        Alert.alert('Error', 'No account found with this email');
      } else if (error.code === 'LimitExceededException') {
        Alert.alert('Error', 'Too many attempts. Please try again later.');
      } else {
        Alert.alert('Error', error.message || 'Failed to send reset code');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6 py-8">
            {/* Icon */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
                <FontAwesome6 name="lock-open" size={32} color="#155C8D" />
              </View>
              <Text className="text-3xl font-bold text-black">Forgot Password?</Text>
              <Text className="text-gray mt-2 text-center">
                {`No worries! Enter your email and we'll send you a reset code.`}
              </Text>
            </View>

            {/* Email Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">Email</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <FontAwesome6 name="envelope" size={16} color="#9ca3af" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  className="flex-1 ml-3 text-gray-800"
                />
              </View>
            </View>

            {/* Send Code Button */}
            <CustomButton
              content={isPending ? 'Sending...' : 'Send Reset Code'}
              onPress={handleSendCode}
              disabled={isPending}
            />

            {/* Back to Login */}
            <TouchableOpacity 
              onPress={() => router.back()}
              className="items-center mt-6"
            >
              <View className="flex-row items-center">
                <FontAwesome6 name="arrow-left" size={14} color="#155C8D" />
                <Text className="text-primary-600 font-semibold ml-2">Back to Login</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}