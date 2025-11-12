import { CustomButton } from '@/components/common/CustomButton';
import { ErrorView } from '@/components/common/ErrorView';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { DateNavigator } from '@/components/ui/DateNavigator';
import { AddLogCard, LogCard } from '@/components/ui/LogCard';
import { Colors } from '@/constants/colors';
import { useCats } from '@/hooks/useCats';
import { useLogs } from '@/hooks/useLogs';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function LogsScreen() {
  const { data: logs = [], isLoading: logsLoading, error: logsError } = useLogs();
  const { data: cats = [], isLoading: catsLoading } = useCats();
  const [selectedCatId, setSelectedCatId] = useState<string | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const isLoading = logsLoading || catsLoading;

  // Format date to YYYY-MM-DD for comparison
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const selectedDateString = formatDate(selectedDate);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (logsError) {
    return <ErrorView message="Error loading logs" />;
  }

  // Get cats to display based on selected filter
  const displayCats = selectedCatId === 'all' ? cats : cats.filter(c => c.id === selectedCatId);

  // Get logs for selected date
  const logsForDate = logs.filter(log => log.date === selectedDateString);

  return (
    <View className="flex-1 bg-white">
      {/* Date Navigator */}
      <DateNavigator 
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      
      {/* Cat Tabs */}
      <View className="bg-white border-b border-gray-200">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-6 py-3"
        >
          <View className="flex-row gap-2">
            {/* All Cats Tab */}
            <TouchableOpacity
              onPress={() => setSelectedCatId('all')}
              className={`px-4 py-2 rounded-full flex-row items-center ${
                selectedCatId === 'all' 
                  ? 'bg-primary-600' 
                  : 'bg-gray-100'
              }`}
            >
              <FontAwesome6 
                name="cat" 
                size={16} 
                color={selectedCatId === 'all' ? 'white' : Colors.gray.DEFAULT} 
              />
              <Text className={`ml-2 font-semibold ${
                selectedCatId === 'all' 
                  ? 'text-white' 
                  : 'text-gray-600'
              }`}>
                All Cats
              </Text>
            </TouchableOpacity>

            {/* Individual Cat Tabs */}
            {cats.map(cat => {
              const catLogCount = logsForDate.filter(log => log.catId === cat.id).length;
              const isSelected = selectedCatId === cat.id;
              
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCatId(cat.id)}
                  className={`px-4 py-2 rounded-full flex-row items-center ${
                    isSelected ? 'bg-primary-600' : 'bg-gray-100'
                  }`}
                >
                  {cat.photoUri ? (
                    <Image 
                      source={{ uri: cat.photoUri }} 
                      className="w-6 h-6 rounded-full mr-2"
                    />
                  ) : (
                    <View className="w-6 h-6 rounded-full bg-primary-200 items-center justify-center mr-2">
                      <FontAwesome6 name="cat" size={12} color={Colors.primary.DEFAULT} />
                    </View>
                  )}
                  <Text className={`font-semibold ${
                    isSelected ? 'text-white' : 'text-gray-600'
                  }`}>
                    {cat.name}
                  </Text>
                  {catLogCount > 0 && (
                    <View className={`ml-2 w-5 h-5 rounded-full items-center justify-center ${
                      isSelected ? 'bg-white' : 'bg-gray-200'
                    }`}>
                      <Text className={`text-xs font-bold ${
                        isSelected ? 'text-primary-600' : 'text-gray-600'
                      }`}>
                        {catLogCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Logs List */}
      <ScrollView className="flex-1 px-6 pt-6">
        {cats.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-32 h-32 bg-primary-200 rounded-full items-center justify-center mb-4">
              <FontAwesome6 name="cat" size={64} color={Colors.primary[500]} />
            </View>
            <Text className="text-gray-800 text-xl font-bold mb-2">
              No cats yet
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              Add a cat first to start logging
            </Text>
            <CustomButton
              content="Add Your First Cat"
              onPress={() => router.push('/my-cats/create')}
              className='px-8 py-3'
              textClassName='font-semibold'
            />
          </View>
        ) : (
          displayCats.map(cat => {
            // Find log for this cat on selected date
            const existingLog = logsForDate.find(log => log.catId === cat.id);

            if (existingLog) {
              // Show existing log
              return (
                <LogCard
                  key={cat.id}
                  log={existingLog}
                  cat={cat}
                  onPress={() => router.push(`/logs/${existingLog.id}`)}
                />
              );
            } else {
              // Show add log card
              return (
                <AddLogCard
                  key={cat.id}
                  cat={cat}
                  onPress={() => router.push({
                    pathname: '/logs/[id]/create',
                    params: { id: cat.id, date: selectedDateString },
                  })}
                />
              );
            }
          })
        )}
      </ScrollView>
    </View>
  );
}