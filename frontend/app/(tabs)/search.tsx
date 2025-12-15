import { ErrorView } from '@/components/common/ErrorView';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { DiseaseCard } from '@/components/ui/DiseaseCard';
import { useDiseases } from '@/hooks/useDiseases';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function DiseasesSearchScreen() {
  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // Debounce search query - wait 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const { data: diseases = [], isLoading, error } = useDiseases(debouncedQuery);

  return (
    <View className="flex-1 bg-gray-50 p-0">
      {/* Search Bar */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <FontAwesome6 name="magnifying-glass" size={18} color="#9ca3af" />
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Search diseases, symptoms..."
            placeholderTextColor="#9ca3af"
            className="flex-1 ml-3 text-gray-900 text-base"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {inputValue.length > 0 && (
            <TouchableOpacity onPress={() => setInputValue('')}>
              <FontAwesome6 name="xmark" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Loading indicator below search bar */}
        {isLoading && inputValue !== debouncedQuery && (
          <View className="mt-2">
            <Text className="text-xs text-gray-500 text-center">Searching...</Text>
          </View>
        )}
      </View>

      {/* Results Count */}
      {!isLoading && (
        <View className="px-6 py-3 bg-white border-b border-gray-100">
          <Text className="text-sm text-gray-600">
            {diseases.length} {diseases.length === 1 ? 'disease' : 'diseases'} found
          </Text>
        </View>
      )}

      {/* Error State */}
      {error ? (
        <ErrorView message="Failed to load diseases" />
      ) : isLoading && debouncedQuery === '' ? (
        // Only show full-screen loader on initial load
        <LoadingIndicator />
      ) : (
        <>
          {/* Disease List */}
          {diseases.length === 0 ? (
            <View className="flex-1 items-center justify-center px-6">
              <FontAwesome6 name="magnifying-glass" size={48} color="#d1d5db" />
              <Text className="text-gray-500 text-center mt-4 text-base">
                {debouncedQuery
                  ? `No diseases found matching "${debouncedQuery}"`
                  : 'Start typing to search for diseases'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={diseases}
              renderItem={({ item }) => <DiseaseCard item={item} />}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 24 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </View>
  );
}