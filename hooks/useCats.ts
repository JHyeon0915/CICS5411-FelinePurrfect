import { catsApi } from '@/api/cats';
import { CatResponse } from '@/types/cat';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const CATS_QUERY_KEY = ['cats'];

// Get all cats
export function useCats() {
  return useQuery({
    queryKey: CATS_QUERY_KEY,
    queryFn: catsApi.getCats,
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
    },
    onError: (error) => {
      console.error('Failed to add cat:', error);
    },
  });
}

// Update a cat
export function useUpdateCat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: catsApi.updateCat,
    onSuccess: () => {
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
    },
  });
}