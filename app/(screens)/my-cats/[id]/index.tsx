import { Menu } from '@/components/common/Menu';
import { useCats, useDeleteCat } from '@/hooks/useCats';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: cats = [], isLoading } = useCats();
  const [menuVisible, setMenuVisible] = useState(false);
  const deleteCatMutation = useDeleteCat();

  const cat = cats.find(c => c.id === id);

  const getTimeWithOwner = () => {
    if (!cat) return '';
    
    const adoptedDate = new Date(cat.adoptedDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - adoptedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      return months > 0 ? `${years}y ${months}m` : `${years} year${years > 1 ? 's' : ''}`;
    }
  };

  const goToEdit = () => {
    setMenuVisible(false);
    router.push(`/(screens)/my-cats/${id}/edit`);
  };

const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Cat',
      `Are you sure you want to remove ${cat?.name} from your cats?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCatMutation.mutate(id, {
              onSuccess: () => {
                router.back();
              },
              onError: () => {
                Alert.alert('Error', 'Failed to delete cat. Please try again.');
              },
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  if (!cat) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <FontAwesome6 name="cat" size={64} color="#d1d5db" />
        <Text className="text-gray-800 text-xl font-bold mt-4">Cat not found</Text>
        <Text className="text-gray-500 text-center mt-2">
          This cat may have been removed
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-purple-600 px-6 py-3 rounded-xl mt-6"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
    <Stack.Screen
        options={{
          title: cat.name,
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
        {/* Header Image */}
        <View className="w-full h-80 bg-gray-200">
          {cat.photoUri ? (
            <Image
              source={{ uri: cat.photoUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-purple-100">
              <FontAwesome6 name="cat" size={80} color="#a855f7" />
            </View>
          )}
        </View>

        {/* Content */}
        <View className="p-6">
          {/* Name */}
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            {cat.name}
          </Text>

          {/* Info Cards */}
          <View className="flex-row flex-wrap gap-3 mb-6">
            {/* Age */}
            <View className="bg-blue-50 px-4 py-3 rounded-xl flex-row items-center">
              <FontAwesome6 name="cake-candles" size={16} color="#3b82f6" />
              <View className="ml-3">
                <Text className="text-blue-600 text-xs font-medium">Age</Text>
                <Text className="text-blue-900 text-base font-bold">
                  {cat.age} {cat.age === 1 ? 'year' : 'years'}
                </Text>
              </View>
            </View>

            {/* Sex */}
            <View className={`px-4 py-3 rounded-xl flex-row items-center ${
              cat.sex === 'male' ? 'bg-blue-50' : 'bg-pink-50'
            }`}>
              <FontAwesome6 
                name={cat.sex === 'male' ? 'mars' : 'venus'} 
                size={16} 
                color={cat.sex === 'male' ? '#3b82f6' : '#ec4899'} 
              />
              <View className="ml-3">
                <Text className={`text-xs font-medium ${
                  cat.sex === 'male' ? 'text-blue-600' : 'text-pink-600'
                }`}>
                  Sex
                </Text>
                <Text className={`text-base font-bold capitalize ${
                  cat.sex === 'male' ? 'text-blue-900' : 'text-pink-900'
                }`}>
                  {cat.sex}
                </Text>
              </View>
            </View>

            {/* Time with owner */}
            <View className="bg-green-50 px-4 py-3 rounded-xl flex-row items-center">
              <FontAwesome6 name="heart" size={16} color="#10b981" />
              <View className="ml-3">
                <Text className="text-green-600 text-xs font-medium">With you</Text>
                <Text className="text-green-900 text-base font-bold">
                  {getTimeWithOwner()}
                </Text>
              </View>
            </View>

            {/* Weight */}
            {cat.weight && (
              <View className="bg-orange-50 px-4 py-3 rounded-xl flex-row items-center">
                <FontAwesome6 name="weight-scale" size={16} color="#f97316" />
                <View className="ml-3">
                  <Text className="text-orange-600 text-xs font-medium">Weight</Text>
                  <Text className="text-orange-900 text-base font-bold">
                    {cat.weight} kg
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Adoption Date Section */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <FontAwesome6 name="calendar" size={16} color="#6b7280" />
              <Text className="text-gray-700 font-semibold ml-2">Adoption Date</Text>
            </View>
            <Text className="text-gray-900 text-lg font-bold">
              {new Date(cat.adoptedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
    </>
  );
}