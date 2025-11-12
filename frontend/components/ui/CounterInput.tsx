import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CounterInputProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  color: {
    bg: string;
    text: string;
  };
}

export function CounterInput({ label, value, onValueChange, color }: CounterInputProps) {
  const incrementCount = () => {
    onValueChange((Number(value) + 1).toString());
  };

  const decrementCount = () => {
    const newValue = Math.max(0, Number(value) - 1);
    onValueChange(newValue.toString());
  };

  return (
    <View className="mb-6">
      <Text className="text-gray-700 font-semibold mb-3">{label}</Text>
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={decrementCount}
          className={`w-12 h-12 ${color.bg} rounded-full items-center justify-center active:opacity-80`}
        >
          <FontAwesome6 name="minus" size={16} color={color.text} />
        </TouchableOpacity>
        
        <TextInput
          value={value}
          onChangeText={onValueChange}
          keyboardType="numeric"
          className="flex-1 mx-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center text-gray-800 text-xl font-bold"
        />
        
        <TouchableOpacity
          onPress={incrementCount}
          className={`w-12 h-12 ${color.bg} rounded-full items-center justify-center active:opacity-80`}
        >
          <FontAwesome6 name="plus" size={16} color={color.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}