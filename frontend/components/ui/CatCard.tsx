import { CatResponse } from '@/types/cat';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { AddButton } from './AddButton';

interface CatCardProps {
  cat: CatResponse;
  onPress?: () => void;
}

export function CatCard({ cat, onPress }: CatCardProps) {
  const getTimeWithOwner = () => {
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
      return `${years}y ${months}m`;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress ? onPress : () => {router.push(`/(screens)/my-cats/${cat.id}`)}}
      className="bg-white shadow-sm mb-4 overflow-hidden active:opacity-80 border border-gray-light rounded-2xl"
      activeOpacity={0.8}
    >
      <View className="flex-row h-32">
        {/* Cat Photo */}
        <View className="h-full aspect-square bg-primary">
          {cat.photoUri && (
            <Image
              source={{ uri: cat.photoUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          )}
        </View>

        {/* Cat Info */}
        <View className="flex-1 p-4">
          <Text className="text-xl font-bold text-gray-800 mb-2">
            {cat.name}
          </Text>
          
          <View className="flex-row flex-wrap gap-2">
            {/* Age */}
            <View className="flex-row items-center bg-blue-50 px-2 py-1 rounded-full">
              <FontAwesome6 name="cake-candles" size={12} color="#3b82f6" />
              <Text className="text-xs text-blue-600 ml-1">
                {cat.age} {cat.age === 1 ? 'year' : 'years'}
              </Text>
            </View>

            {/* Sex */}
            <View className="flex-row items-center bg-pink-50 px-2 py-1 rounded-full">
              <FontAwesome6 
                name={cat.sex === 'male' ? 'mars' : 'venus'} 
                size={12} 
                color={cat.sex === 'male' ? '#3b82f6' : '#ec4899'} 
              />
              <Text className="text-xs text-pink-600 ml-1 capitalize">
                {cat.sex}
              </Text>
            </View>

            {/* Time with owner */}
            <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
              <FontAwesome6 name="heart" size={12} color="#10b981" />
              <Text className="text-xs text-green-600 ml-1">
                {getTimeWithOwner()}
              </Text>
            </View>

            {/* Weight (if provided) */}
            {cat.weight && (
              <View className="flex-row items-center bg-orange-50 px-2 py-1 rounded-full">
                <FontAwesome6 name="weight-scale" size={12} color="#f97316" />
                <Text className="text-xs text-orange-600 ml-1">
                  {cat.weight} kg
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface AddCatCardProps {
  onPress?: () => void;
}

export function AddCatCard({ onPress }: AddCatCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress ? onPress : () => router.push('/(screens)/my-cats/create')}
      className="bg-white shadow-sm mb-4 overflow-hidden border border-dashed border-gray-light rounded-2xl"
    >
      <View className="flex-row h-32 items-center justify-center">
        <AddButton title="Add New Cat" />
      </View>
    </TouchableOpacity>
  );
}