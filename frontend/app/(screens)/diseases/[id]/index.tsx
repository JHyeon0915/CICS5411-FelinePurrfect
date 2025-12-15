import { ErrorView } from '@/components/common/ErrorView';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { Colors } from '@/constants/colors';
import { useDisease } from '@/hooks/useDiseases';
import { getSeverityColor } from '@/utils/disease-details';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { twMerge } from 'tailwind-merge';

export default function DiseaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: disease, isLoading, error } = useDisease(id);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error || !disease) {
    return <ErrorView message="Disease not found" />;
  }

  const severityColors = getSeverityColor(disease.severity);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-primary px-6 pt-6 pb-8">
          <Text className="text-white text-3xl font-bold mb-3">
            {disease.name}
          </Text>
          
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center bg-white/20 px-3 py-1.5 rounded-lg">
              <FontAwesome6 name="tag" size={14} color="white" />
              <Text className="text-white ml-2 font-medium">
                {disease.category}
              </Text>
            </View>

            <View className={twMerge(`px-4 py-1.5 rounded-full`, severityColors.bg, severityColors.border)}>
              <Text className={twMerge(`text-sm font-bold capitalize`, severityColors.text)}>
                {disease.severity.replace('-', ' ')}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6 py-6">
          {/* Description */}
          <View className="mb-8">
            <View className="flex-row items-center mb-3">
              <FontAwesome6 name="circle-info" size={20} color={Colors.primary[600]} />
              <Text className="text-xl font-bold text-gray-900 ml-2">
                About This Disease
              </Text>
            </View>
            <Text className="text-base text-gray-700 leading-6">
              {disease.description}
            </Text>
          </View>

          {/* Symptoms */}
          {disease.symptoms && disease.symptoms.length > 0 && (
            <View className="mb-8">
              <View className="flex-row items-center mb-3">
                <FontAwesome6 name="heart-pulse" size={20} color={Colors.primary[600]} />
                <Text className="text-xl font-bold text-gray-900 ml-2">
                  Common Symptoms
                </Text>
              </View>
              <View className="bg-red-50 rounded-2xl p-4 border border-red-100">
                {disease.symptoms.map((symptom, index) => (
                  <View
                    key={index}
                    className="flex-row items-start mb-2 last:mb-0"
                  >
                    <FontAwesome6
                      name="circle"
                      size={6}
                      color="#ef4444"
                      style={{ marginTop: 7 }}
                    />
                    <Text className="flex-1 text-gray-800 ml-3 text-base">
                      {symptom}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Prevention */}
          {disease.prevention && disease.prevention.length > 0 && (
            <View className="mb-8">
              <View className="flex-row items-center mb-3">
                <FontAwesome6 name="shield-halved" size={20} color={Colors.primary[600]} />
                <Text className="text-xl font-bold text-gray-900 ml-2">
                  Prevention & Care
                </Text>
              </View>
              <View className="bg-green-50 rounded-2xl p-4 border border-green-100">
                {disease.prevention.map((item, index) => (
                  <View
                    key={index}
                    className="flex-row items-start mb-3 last:mb-0"
                  >
                    <View className="bg-green-500 rounded-full w-6 h-6 items-center justify-center mt-0.5">
                      <FontAwesome6 name="check" size={12} color="white" />
                    </View>
                    <Text className="flex-1 text-gray-800 ml-3 text-base leading-6">
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Important Notice */}
          <View className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
            <View className="flex-row items-start">
              <FontAwesome6 name="triangle-exclamation" size={20} color="#eab308" />
              <View className="flex-1 ml-3">
                <Text className="font-bold text-gray-900 mb-1">
                  Important Notice
                </Text>
                <Text className="text-sm text-gray-700 leading-5">
                  This information is for educational purposes only. If you suspect your cat has this condition, please consult with a licensed veterinarian for proper diagnosis and treatment.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}