import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'expo-router';
import { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isAuthenticated } = useAuth();

  // Show loading while checking auth status
  if (user === undefined) {
    return <LoadingIndicator />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // User is authenticated, render children
  return <>{children}</>;
}