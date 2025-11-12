import { Text, View } from 'react-native';

interface ErrorViewProps {
  message?: string;
}

export function ErrorView({ message = 'Unknown error occurred' }: ErrorViewProps) {
  return (
    <View className="flex-1 bg-gray-50 items-center justify-center px-6">
      <Text className="text-red-600 text-center">{message}</Text>
    </View>
  );
}