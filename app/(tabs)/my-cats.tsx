import { CustomButton } from '@/components/common/CustomButton';
import { ErrorView } from '@/components/common/ErrorView';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { CatCard } from '@/components/ui/CatCard';
import { Colors } from '@/constants/colors';
import { useCats } from '@/hooks/useCats';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

export default function MyCatsScreen() {
  const { data: cats = [], isLoading, error } = useCats();

  if (isLoading) {
    return (<LoadingIndicator />);
  }

  if (error) {
    return (<ErrorView message="Error loading cats. Please try again." />);
  }

  return (
    <View className="flex-1 bg-white">
      {/* Cat List */}
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
              Add your first furry friend to get started!
            </Text>
            <CustomButton
              content="Add Your First Cat"
              onPress={() => router.push('/(screens)/my-cats/create')}
              className='px-8 py-3'
              textClassName='font-semibold'
            />
          </View>
        ) : (
          cats.map((cat) => <CatCard key={cat.id} cat={cat} />)
        )}
      </ScrollView>
    </View>
  );
}