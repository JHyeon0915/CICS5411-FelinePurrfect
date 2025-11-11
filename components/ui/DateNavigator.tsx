import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Text, TouchableOpacity, View } from 'react-native';

interface DateNavigatorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DateNavigator({ selectedDate, onDateChange }: DateNavigatorProps) {
  // Format date to YYYY-MM-DD for comparison
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = formatDate(selectedDate) === formatDate(new Date());

  // Navigate to previous day
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  // Navigate to next day
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  // Jump to today
  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <View className="bg-white border-b border-gray-200 px-6 pt-6 pb-4">
      <View className="flex-row items-center justify-between">
        {/* Previous Day Button */}
        <TouchableOpacity
          onPress={goToPreviousDay}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 active:opacity-80"
        >
          <FontAwesome6 name="chevron-left" size={16} color="#374151" />
        </TouchableOpacity>

        {/* Date Display */}
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-gray-800">
            {isToday 
              ? 'Today' 
              : selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric',
                })
            }
          </Text>
          <Text className="text-sm text-gray-500">
            {selectedDate.toLocaleDateString('en-US', { 
              year: 'numeric',
            })}
          </Text>
          {!isToday && (
            <TouchableOpacity onPress={goToToday} className="mt-1">
              <Text className="text-primary-600 text-xs font-semibold">
                Jump to Today
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Next Day Button */}
        <TouchableOpacity
          onPress={goToNextDay}
          disabled={isToday}
          className={`w-10 h-10 items-center justify-center rounded-full ${
            isToday ? 'bg-gray-100 opacity-40' : 'bg-gray-100 active:opacity-80'
          }`}
        >
          <FontAwesome6 name="chevron-right" size={16} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );
}