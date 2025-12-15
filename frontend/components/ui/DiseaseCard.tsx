import { DiseaseResponse } from '@/types/disease';
import { getCategoryIcon, getSeverityColor } from '@/utils/disease-details';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export function DiseaseCard({ item }: { item: DiseaseResponse }) {
  const severityColors = getSeverityColor(item.severity);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/diseases/${item.id}`)}
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 active:opacity-70"
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-bold text-gray-900 mb-1">
            {item.name}
          </Text>
          
          {/* Category */}
          <View className="flex-row items-center">
            <FontAwesome6 
              name={getCategoryIcon(item.category)} 
              size={12} 
              color="#6b7280" 
            />
            <Text className="text-xs text-gray-600 ml-1.5">
              {item.category}
            </Text>
          </View>
        </View>

        {/* Severity Badge - FIXED: Separate className for each style */}
        <View className={`px-3 py-1 rounded-full border ${severityColors.bg} ${severityColors.border}`}>
          <Text className={`text-xs font-semibold capitalize ${severityColors.text}`}>
            {item.severity.replace('-', ' ')}
          </Text>
        </View>
      </View>

      {/* Description Preview */}
      <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
        {item.description}
      </Text>

      {/* Symptoms Preview */}
      {item.symptoms && item.symptoms.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {item.symptoms.slice(0, 3).map((symptom, index) => (
            <View
              key={index}
              className="bg-purple-50 px-2 py-1 rounded-lg"
            >
              <Text className="text-xs text-purple-700">
                {symptom}
              </Text>
            </View>
          ))}
          {item.symptoms.length > 3 && (
            <View className="bg-gray-100 px-2 py-1 rounded-lg">
              <Text className="text-xs text-gray-600">
                +{item.symptoms.length - 3} more
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Arrow */}
      <View className="absolute right-4 top-1/2 -translate-y-2">
        <FontAwesome6 name="chevron-right" size={16} color="#d1d5db" />
      </View>
    </TouchableOpacity>
  );
}