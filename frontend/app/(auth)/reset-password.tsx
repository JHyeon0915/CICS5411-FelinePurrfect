import { CustomButton } from '@/components/common/CustomButton';
import { useConfirmForgotPassword, useForgotPassword } from '@/hooks/useAuth';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const confirmForgotPasswordMutation = useConfirmForgotPassword();
  const forgotPasswordMutation = useForgotPassword();
  
  const isLoading = confirmForgotPasswordMutation.isPending || forgotPasswordMutation.isPending;

  const validatePassword = () => {
    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return false;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return false;
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      Alert.alert(
        'Weak Password',
        'Password must contain:\n• Uppercase letter\n• Lowercase letter\n• Number\n• Special character'
      );
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (!validatePassword()) return;

    confirmForgotPasswordMutation.mutate(
      { email, code: code.trim(), newPassword },
      {
        onSuccess: () => {
          Alert.alert(
            'Success',
            'Your password has been reset successfully!',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(auth)/login')
              }
            ]
          );
        },
        onError: (error: any) => {
          console.error('Reset password error:', error);
          
          if (error.code === 'CodeMismatchException') {
            Alert.alert('Error', 'Invalid verification code');
          } else if (error.code === 'ExpiredCodeException') {
            Alert.alert('Error', 'Verification code has expired. Please request a new one.');
          } else if (error.code === 'InvalidPasswordException') {
            Alert.alert('Error', 'Password does not meet requirements');
          } else {
            Alert.alert('Error', error.message || 'Failed to reset password');
          }
        }
      }
    );
  };

  const handleResendCode = () => {
    forgotPasswordMutation.mutate(email, {
      onSuccess: () => {
        Alert.alert('Success', 'A new verification code has been sent to your email');
      },
      onError: (error: any) => {
        console.error('Resend error:', error);
        Alert.alert('Error', error.message || 'Failed to resend code');
      }
    });
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
                <FontAwesome6 name="key" size={32} color="#155C8D" />
              </View>
              <Text className="text-3xl font-bold text-black">Reset Password</Text>
              <Text className="text-gray mt-2 text-center">
                Enter the code sent to
              </Text>
              <Text className="text-primary-600 font-semibold mt-1">{email}</Text>
            </View>

            {/* Verification Code Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Verification Code</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <FontAwesome6 name="envelope-open-text" size={16} color="#9ca3af" />
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="Enter 6-digit code"
                  keyboardType="number-pad"
                  maxLength={6}
                  className="flex-1 ml-3 text-gray-800 text-lg tracking-widest"
                />
              </View>
            </View>

            {/* New Password Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">New Password</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <FontAwesome6 name="lock" size={16} color="#9ca3af" />
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Min. 8 characters"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  className="flex-1 ml-3 text-gray-800"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <FontAwesome6 
                    name={showPassword ? 'eye' : 'eye-slash'} 
                    size={16} 
                    color="#9ca3af" 
                  />
                </TouchableOpacity>
              </View>
              <Text className="text-xs text-gray-500 mt-1">
                Must include uppercase, lowercase, number, and special character
              </Text>
            </View>

            {/* Confirm Password Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">Confirm Password</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <FontAwesome6 name="lock" size={16} color="#9ca3af" />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter password"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  className="flex-1 ml-3 text-gray-800"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <FontAwesome6 
                    name={showConfirmPassword ? 'eye' : 'eye-slash'} 
                    size={16} 
                    color="#9ca3af" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Reset Button */}
            <CustomButton
              content={isLoading ? 'Resetting...' : 'Reset Password'}
              onPress={handleResetPassword}
              disabled={isLoading}
            />

            {/* Resend Code */}
            <View className="items-center mt-6">
              <Text className="text-gray-600 mb-2">{`Didn't receive the code?`}</Text>
              <TouchableOpacity 
                onPress={handleResendCode}
                disabled={isLoading}
              >
                <Text className="text-primary-600 font-semibold">Resend Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}