import { ErrorView } from '@/components/common/ErrorView';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { Menu } from '@/components/common/Menu';
import { useCats } from '@/hooks/useCats';
import { useDeleteLog, useLogs } from '@/hooks/useLogs';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function LogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: logs = [], isLoading: logsLoading } = useLogs();
  const { data: cats = [], isLoading: catsLoading } = useCats();
  const [menuVisible, setMenuVisible] = useState(false);
  const deleteLogMutation = useDeleteLog();

  const log = logs.find(l => l.id === id);
  const cat = cats.find(c => c.id === log?.catId);

  const goToEdit = () => {
    setMenuVisible(false);
    router.push(`/logs/${id}/edit`);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Log',
      'Are you sure you want to delete this log entry?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteLogMutation.mutate(id, {
              onSuccess: () => {
                router.back();
              },
              onError: () => {
                Alert.alert('Error', 'Failed to delete log. Please try again.');
              },
            });
          },
        },
      ]
    );
  };

  if (logsLoading || catsLoading) {
    return <LoadingIndicator />;
  }

  if (!log || !cat) {
    return (
      <ErrorView message="This log may have been removed. Please go back and try again." />
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Log Details',
          headerRight: () => (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setMenuVisible(true)} className='px-4'>
                  <FontAwesome6 name="ellipsis-vertical" size={24} color="black" />
                </TouchableOpacity>
              }
              items={[
                {
                  title: 'Edit',
                  icon: 'pen-to-square',
                  onPress: goToEdit,
                },
                {
                  title: 'Delete',
                  icon: 'trash',
                  onPress: handleDelete,
                  destructive: true,
                },
              ]}
            />
          ),
        }}
      />
    
      <View className="flex-1 bg-white">
        <ScrollView className="flex-1">
          {/* Date */}
          <Text className="text-black text-xl text-center font-bold my-4">
            {new Date(log.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>

          {/* Header - Cat Info */}
          <View className="px-6 pt-6 pb-8">
            <View className="flex-row items-center">
              {cat.photoUri ? (
                <Image 
                  source={{ uri: cat.photoUri }} 
                  className="w-20 h-20 rounded-full mr-4"
                />
              ) : (
                <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mr-4">
                  <FontAwesome6 name="cat" size={32} color="#9333ea" />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-gray-dark text-sm font-medium">Log for</Text>
                <Text className="text-black text-2xl font-bold mb-1">{cat.name}</Text>

              </View>
            </View>
          </View>

          {/* Content */}
          <View className="p-6">
            {/* Daily Activities Section */}
            <Text className="text-gray-800 text-xl font-bold mb-4">
              Daily Activities
            </Text>

            <View className="flex-row flex-wrap gap-3 mb-6">
              {/* Poo Count */}
              <View className="bg-amber-50 px-4 py-3 rounded-xl flex-row items-center">
                <FontAwesome6 name="poo" size={17} color="#f59e0b" />
                <View className="ml-3">
                  <Text className="text-amber-600 text-xs font-medium">Poo</Text>
                  <Text className="text-amber-900 text-2xl font-bold">
                    {log.pooCount}
                  </Text>
                </View>
              </View>

              {/* Pee Count */}
              <View className="bg-yellow-50 px-4 py-3 rounded-xl flex-row items-center">
                <FontAwesome6 name="droplet" size={17} color="#eab308" />
                <View className="ml-3">
                  <Text className="text-yellow-600 text-xs font-medium">Pee</Text>
                  <Text className="text-yellow-900 text-2xl font-bold">
                    {log.peeCount}
                  </Text>
                </View>
              </View>

              {/* Food Count */}
              <View className="bg-orange-50 px-4 py-3 rounded-xl flex-row items-center">
                <FontAwesome6 name="bowl-food" size={17} color="#f97316" />
                <View className="ml-3">
                  <Text className="text-orange-600 text-xs font-medium">Food</Text>
                  <Text className="text-orange-900 text-2xl font-bold">
                    {log.foodCount}
                  </Text>
                </View>
              </View>

              {/* Water Count */}
              <View className="bg-blue-50 px-4 py-3 rounded-xl flex-row items-center">
                <FontAwesome6 name="glass-water" size={17} color="#3b82f6" />
                <View className="ml-3">
                  <Text className="text-blue-600 text-xs font-medium">Water</Text>
                  <Text className="text-blue-900 text-2xl font-bold">
                    {log.waterCount}
                  </Text>
                </View>
              </View>
            </View>

            {/* Additional Info Section */}
            {(log.weight || log.temperature) && (
              <>
                <Text className="text-gray-800 text-xl font-bold mb-4 mt-2">
                  Additional Info
                </Text>

                <View className="flex-row flex-wrap gap-3 mb-6">
                  {/* Weight */}
                  {log.weight && (
                    <View className="bg-purple-50 px-4 py-3 rounded-xl flex-row items-center">
                      <FontAwesome6 name="weight-scale" size={20} color="#a855f7" />
                      <View className="ml-3">
                        <Text className="text-purple-600 text-xs font-medium">Weight</Text>
                        <Text className="text-purple-900 text-2xl font-bold">
                          {log.weight} <Text className="text-base">kg</Text>
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Temperature */}
                  {log.temperature && (
                    <View className="bg-red-50 px-4 py-3 rounded-xl flex-row items-center">
                      <FontAwesome6 name="temperature-half" size={20} color="#ef4444" />
                      <View className="ml-3">
                        <Text className="text-red-600 text-xs font-medium">Temperature</Text>
                        <Text className="text-red-900 text-2xl font-bold">
                          {log.temperature} <Text className="text-base">°C</Text>
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Notes Section */}
            {log.notes && (
              <>
                <Text className="text-gray-800 text-xl font-bold mb-4 mt-2">
                  Notes
                </Text>
                <View className="bg-gray-50 rounded-2xl p-4 mb-6">
                  <Text className="text-gray-900 text-base leading-6">
                    {log.notes}
                  </Text>
                </View>
              </>
            )}

            {/* Timestamp */}
            <View className="bg-gray-50 rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <FontAwesome6 name="clock" size={14} color="#6b7280" />
                <Text className="text-gray-600 text-xs font-medium ml-2">Created</Text>
              </View>
              <Text className="text-gray-900 text-sm">
                {new Date(log.createdAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Text>
              {log.updatedAt !== log.createdAt && (
                <>
                  <View className="flex-row items-center mb-2 mt-3">
                    <FontAwesome6 name="pen" size={14} color="#6b7280" />
                    <Text className="text-gray-600 text-xs font-medium ml-2">Last Updated</Text>
                  </View>
                  <Text className="text-gray-900 text-sm">
                    {new Date(log.updatedAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}