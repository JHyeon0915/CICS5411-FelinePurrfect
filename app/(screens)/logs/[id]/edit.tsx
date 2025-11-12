import { CustomButton } from '@/components/common/CustomButton';
import { ErrorView } from '@/components/common/ErrorView';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { RequiredIndicator } from '@/components/common/RequiredIndicator';
import { CounterInput } from '@/components/ui/CounterInput';
import { useCats } from '@/hooks/useCats';
import { useLogs, useUpdateLog } from '@/hooks/useLogs';
import { LogResponse } from '@/types/log';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LogEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: logs = [], isLoading: logsLoading } = useLogs();
  const { data: cats = [], isLoading: catsLoading } = useCats();
  const updateLogMutation = useUpdateLog();

  const log = logs.find(l => l.id === id);
  const cat = cats.find(c => c.id === log?.catId);

  // Log counts
  const [pooCount, setPooCount] = useState('0');
  const [peeCount, setPeeCount] = useState('0');
  const [foodCount, setFoodCount] = useState('0');
  const [waterCount, setWaterCount] = useState('0');

  // Optional fields
  const [weight, setWeight] = useState('');
  const [temperature, setTemperature] = useState('');
  const [notes, setNotes] = useState('');

  // Pre-fill form with existing log data
  useEffect(() => {
    if (log) {
      setPooCount(log.pooCount.toString());
      setPeeCount(log.peeCount.toString());
      setFoodCount(log.foodCount.toString());
      setWaterCount(log.waterCount.toString());
      setWeight(log.weight ? log.weight.toString() : '');
      setTemperature(log.temperature ? log.temperature.toString() : '');
      setNotes(log.notes || '');
    }
  }, [log]);

  const handleUpdate = () => {
    if (!log) return;

    // Validate counts
    const counts = [pooCount, peeCount, foodCount, waterCount];
    if (counts.some(count => isNaN(Number(count)) || Number(count) < 0)) {
      Alert.alert('Error', 'Please enter valid counts');
      return;
    }

    // Validate optional fields
    if (weight && (isNaN(Number(weight)) || Number(weight) < 0)) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }

    if (temperature && (isNaN(Number(temperature)) || Number(temperature) < 0)) {
      Alert.alert('Error', 'Please enter a valid temperature');
      return;
    }

    const updatedLog: LogResponse = {
      ...log,
      pooCount: Number(pooCount),
      peeCount: Number(peeCount),
      foodCount: Number(foodCount),
      waterCount: Number(waterCount),
      weight: weight ? Number(weight) : null,
      temperature: temperature ? Number(temperature) : null,
      notes: notes.trim() || null,
    };

    updateLogMutation.mutate(updatedLog, {
      onSuccess: () => {
        router.back();
      },
      onError: () => {
        Alert.alert('Error', 'Failed to update log. Please try again.');
      },
    });
  };

  if (logsLoading || catsLoading) {
    return <LoadingIndicator />;
  }

  if (!log || !cat) {
    return (
      <>
        <ErrorView message="Log not found" />
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-purple-600 px-6 py-3 rounded-xl mt-4 active:opacity-80"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </>
    );
  }

  return (
    <SafeAreaView className='flex-1' edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className='flex-1'>
        <ScrollView className="flex-1 p-6" 
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Date Display */}
          <Text className="mb-6 text-black text-xl text-center font-bold">
            {new Date(log.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>

          {/* Cat Display */}
          <View className="mb-8">
            <View className="flex-row items-center justify-center gap-x-1 px-4 py-4 rounded-xl bg-gray-50">
              {cat.photoUri ? (
                <Image 
                  source={{ uri: cat.photoUri }} 
                  className="w-8 h-8 rounded-full mr-2"
                />
              ) : (
                <View className="w-8 h-8 rounded-full bg-primary-100 items-center justify-center mr-2">
                  <FontAwesome6 name="cat" size={14} color="#9333ea" />
                </View>
              )}
              <Text className="font-semibold text-black text-lg">
                {cat.name}
              </Text>
            </View>
          </View>

          {/* Required Counts Section */}
          <Text className="text-gray-800 text-lg font-bold mb-6">
            Daily Activities
            <RequiredIndicator />
          </Text>

          {/* Poo Count */}
          <CounterInput
            label="Poo Count"
            value={pooCount}
            onValueChange={setPooCount}
            color={{ bg: 'bg-amber-100', text: '#f59e0b' }}
          />

          {/* Pee Count */}
          <CounterInput
            label="Pee Count"
            value={peeCount}
            onValueChange={setPeeCount}
            color={{ bg: 'bg-yellow-100', text: '#eab308' }}
          />

          {/* Food Count */}
          <CounterInput
            label="Food Count"
            value={foodCount}
            onValueChange={setFoodCount}
            color={{ bg: 'bg-orange-100', text: '#f97316' }}
          />

          {/* Water Count */}
          <CounterInput
            label="Water Count"
            value={waterCount}
            onValueChange={setWaterCount}
            color={{ bg: 'bg-blue-100', text: '#3b82f6' }}
          />

          {/* Optional Section */}
          <Text className="text-gray-800 text-lg font-bold mb-6 mt-2">
            Additional Info (Optional)
          </Text>

          {/* Weight Input */}
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-3">
              Weight (kg)
            </Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              placeholder="0.0"
              keyboardType="decimal-pad"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
            />
          </View>

          {/* Temperature Input */}
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-3">
              Temperature (°C)
            </Text>
            <TextInput
              value={temperature}
              onChangeText={setTemperature}
              placeholder="38.0"
              keyboardType="decimal-pad"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
            />
          </View>

          {/* Notes Input */}
          <View className="mb-8">
            <Text className="text-gray-700 font-semibold mb-3">
              Notes
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Any observations or notes..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
            />
          </View>
  
          {/* Update Button */}
          <CustomButton
            content={updateLogMutation.isPending ? 'Updating...' : 'Update Log'}
            onPress={handleUpdate}
            disabled={updateLogMutation.isPending}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}