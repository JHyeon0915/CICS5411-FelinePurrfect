import { catsApi } from '@/api/cats';
import { CatResponse } from '@/types/cat';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

const CATS_QUERY_KEY = ['cats'];

// Get all cats
export function useCats() {
  return useQuery({
    queryKey: CATS_QUERY_KEY,
    queryFn: catsApi.getCats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get single cat
export function useCat(catId: string) {
  return useQuery({
    queryKey: [...CATS_QUERY_KEY, catId],
    queryFn: () => catsApi.getCat(catId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!catId,
  });
}

// Add a cat
export function useAddCat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: catsApi.addCat,
    onSuccess: (newCat) => {
      // Add the returned cat to cache
      queryClient.setQueryData<CatResponse[]>(CATS_QUERY_KEY, (old = []) => [
        ...old,
        newCat,
      ]);
      
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'analytics'] });
      Alert.alert('Success', 'Cat added successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to add cat:', error);
      Alert.alert('Error', error.message || 'Failed to add cat');
    },
  });
}

// Update a cat
export function useUpdateCat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: catsApi.updateCat,
    onMutate: async (updatedCat) => {
      await queryClient.cancelQueries({ queryKey: CATS_QUERY_KEY });
      const previousCats = queryClient.getQueryData<CatResponse[]>(CATS_QUERY_KEY);
      
      // Optimistically update cache
      queryClient.setQueryData<CatResponse[]>(CATS_QUERY_KEY, (old = []) =>
        old.map(cat => cat.catId === updatedCat.catId ? { ...cat, ...updatedCat } : cat)
      );
      
      return { previousCats };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'analytics'] });
      Alert.alert('Success', 'Cat updated successfully!');
    },
    onError: (err: any, updatedCat, context) => {
      // Rollback on error
      if (context?.previousCats) {
        queryClient.setQueryData<CatResponse[]>(CATS_QUERY_KEY, context.previousCats);
      }
      console.error('Failed to update cat:', err);
      Alert.alert('Error', err.message || 'Failed to update cat');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CATS_QUERY_KEY });
    },
  });
}

// Delete a cat
export function useDeleteCat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: catsApi.deleteCat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'analytics'] });
      Alert.alert('Success', 'Cat removed successfully');
    },
    onError: (error: any) => {
      console.error('Failed to delete cat:', error);
      Alert.alert('Error', error.message || 'Failed to delete cat');
    },
  });
}