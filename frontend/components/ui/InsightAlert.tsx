import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

interface InsightAlertProps {
  type: 'warning' | 'info' | 'success';
  catName: string;
  message: string;
  relatedTopics?: string[];
}

export function InsightAlert({ type, catName, message, relatedTopics = [] }: InsightAlertProps) {
  const styles = {
    warning: {
      container: 'bg-amber-50 border-amber-200',
      icon: 'triangle-exclamation',
      iconColor: '#f59e0b',
      textColor: 'text-amber-900',
      badgeColor: 'bg-amber-100',
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'circle-info',
      iconColor: '#3b82f6',
      textColor: 'text-blue-900',
      badgeColor: 'bg-blue-100',
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'circle-check',
      iconColor: '#10b981',
      textColor: 'text-green-900',
      badgeColor: 'bg-green-100',
    },
  };

  const style = styles[type];

  return (
    <View className={`${style.container} border rounded-2xl p-4 mb-4`}>
      <View className="flex-row items-start mb-3">
        <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
          <FontAwesome6 name={style.icon as any} size={18} color={style.iconColor} />
        </View>
        <View className="flex-1">
          <Text className={`font-bold text-base ${style.textColor} mb-1`}>
            {catName}
          </Text>
          <Text className={`${style.textColor} text-sm leading-5`}>
            {message}
          </Text>
        </View>
      </View>

      {relatedTopics.length > 0 && (
        <View className="mt-2 pt-3 border-t border-opacity-20" style={{ borderTopColor: style.iconColor }}>
          <Text className={`${style.textColor} text-xs font-semibold mb-2`}>
            Related Topics:
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {relatedTopics.map((topic, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => router.push({ pathname: '/(tabs)/search', params: { query: topic } })}
                className={`${style.badgeColor} px-3 py-1.5 rounded-full active:opacity-80`}
              >
                <Text className={`${style.textColor} text-xs font-medium`}>
                  {topic}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}