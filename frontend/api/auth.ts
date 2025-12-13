import { AuthUser, SignInRequest, SignInResponse, SignUpRequest } from '@/types/auth';
import * as SecureStore from 'expo-secure-store';

const AUTH_API_URL = process.env.EXPO_PUBLIC_AUTH_API_URL!;

// Secure storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const authApi = {
  // Get current user from secure storage
  getCurrentUser: async (): Promise<AuthUser | null> => {
    try {
      const userData = await SecureStore.getItemAsync(USER_KEY);
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      
      if (userData && token) {
        return JSON.parse(userData);
      }
      return null;
    } catch {
      return null;
    }
  },

  // Sign Up
  signUp: async (data: SignUpRequest): Promise<void> => {
    console.log(AUTH_API_URL);
    const response = await fetch(`${AUTH_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    console.log(result);

    if (!response.ok) {
      throw {
        code: result.code || 'SignUpError',
        message: result.message || 'Failed to create account',
      };
    }

    return result;
  },

  // Confirm Sign Up (Email Verification)
  confirmSignUp: async (email: string, code: string): Promise<void> => {
    const response = await fetch(`${AUTH_API_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        code: result.code || 'VerificationError',
        message: result.message || 'Failed to verify email',
      };
    }

    return result;
  },

  // Resend Confirmation Code
  resendConfirmationCode: async (email: string): Promise<void> => {
    const response = await fetch(`${AUTH_API_URL}/auth/resend-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        code: result.code || 'ResendError',
        message: result.message || 'Failed to resend code',
      };
    }

    return result;
  },

  // Sign In
  signIn: async (data: SignInRequest): Promise<SignInResponse> => {
    const response = await fetch(`${AUTH_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        code: result.code || 'SignInError',
        message: result.message || 'Failed to sign in',
      };
    }

    // Store token and user data securely
    await SecureStore.setItemAsync(TOKEN_KEY, result.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.user));

    return result;
  },

  // Sign Out
  signOut: async (): Promise<void> => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  // Forgot Password
  forgotPassword: async (email: string): Promise<void> => {
    const response = await fetch(`${AUTH_API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        code: result.code || 'ForgotPasswordError',
        message: result.message || 'Failed to send reset code',
      };
    }

    return result;
  },

  // Confirm Forgot Password (Reset Password)
  confirmForgotPassword: async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<void> => {
    const response = await fetch(`${AUTH_API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        code: result.code || 'ResetPasswordError',
        message: result.message || 'Failed to reset password',
      };
    }

    return result;
  },

  // Change Password (for logged-in users)
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${AUTH_API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        code: result.code || 'ChangePasswordError',
        message: result.message || 'Failed to change password',
      };
    }

    return result;
  },

  // Get Auth Token (for API calls)
  getAuthToken: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },
};