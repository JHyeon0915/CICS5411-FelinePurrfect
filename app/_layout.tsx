import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { queryClient } from '@/lib/react-query/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: 'white' },
            headerBackTitle: 'Back',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="(screens)/my-cats/create"
            options={{ title: 'Add New Cat' }}
          />
          <Stack.Screen
            name="(screens)/my-cats/[id]/edit"
            options={{ title: 'Edit Cat' }}
          />
          <Stack.Screen
            name="(screens)/logs/[id]/index"
            options={{ title: 'Log Detail' }}
          />
          <Stack.Screen
            name="(screens)/logs/[id]/create"
            options={{ title: 'Add New Log' }}
          />
          <Stack.Screen
            name="(screens)/logs/[id]/edit"
            options={{ title: 'Edit Log' }}
          />
        </Stack>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
