import { authApi } from '@/api/auth';
import { AuthUser, SignInRequest, SignUpRequest } from '@/types/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

const AUTH_QUERY_KEY = ['auth', 'user'];

// Get current user
export function useAuth() {
  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authApi.getCurrentUser,
    staleTime: Infinity, // User data doesn't go stale
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
  };
}

// Sign Up
export function useSignUp() {
  return useMutation({
    mutationFn: (data: SignUpRequest) => authApi.signUp(data),
    onError: (error) => {
      console.error('Failed to sign up:', error);
    },
  });
}

// Confirm Sign Up (Email Verification)
export function useConfirmSignUp() {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      authApi.confirmSignUp(email, code),
    onError: (error) => {
      console.error('Failed to verify email:', error);
    },
  });
}

// Resend Confirmation Code
export function useResendConfirmationCode() {
  return useMutation({
    mutationFn: (email: string) => authApi.resendConfirmationCode(email),
    onError: (error) => {
      console.error('Failed to resend code:', error);
    },
  });
}

// Sign In
export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignInRequest) => authApi.signIn(data),
    onSuccess: (response) => {
      // Update query cache with user data
      queryClient.setQueryData(AUTH_QUERY_KEY, response.user);
      
      // Navigate to home
      router.replace('/(tabs)');
    },
    onError: (error) => {
      console.error('Failed to sign in:', error);
    },
  });
}

// Sign Out
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.signOut,
    onSuccess: () => {
      // Clear user from cache
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
      
      // Navigate to login
      router.replace('/(auth)/login');
    },
    onError: (error) => {
      console.error('Failed to sign out:', error);
    },
  });
}

// Forgot Password
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onError: (error) => {
      console.error('Failed to send reset code:', error);
    },
  });
}

// Confirm Forgot Password (Reset Password)
export function useConfirmForgotPassword() {
  return useMutation({
    mutationFn: ({
      email,
      code,
      newPassword,
    }: {
      email: string;
      code: string;
      newPassword: string;
    }) => authApi.confirmForgotPassword(email, code, newPassword),
    onError: (error) => {
      console.error('Failed to reset password:', error);
    },
  });
}

// Change Password
export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      oldPassword,
      newPassword,
    }: {
      oldPassword: string;
      newPassword: string;
    }) => authApi.changePassword(oldPassword, newPassword),
    onError: (error) => {
      console.error('Failed to change password:', error);
    },
  });
}

// Get Auth Token (utility)
export const getAuthToken = authApi.getAuthToken;