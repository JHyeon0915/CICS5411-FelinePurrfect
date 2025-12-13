import { LoadingIndicator } from 'components/common/LoadingIndicator';
import { Redirect } from 'expo-router';
import { useAuth } from 'hooks/useAuth';

export default function Index() {
  const { isAuthenticated, user } = useAuth();

  // Show loading while checking auth
  if (user === undefined) {
    return <LoadingIndicator />;
  }

  // Redirect based on auth status
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}