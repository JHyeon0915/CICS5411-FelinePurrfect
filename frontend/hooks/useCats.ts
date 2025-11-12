import { catsApi } from '@/api/cats';
import { CatResponse } from '@/types/cat';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const CATS_QUERY_KEY = ['cats'];

// Get all cats
export function useCats() {
  return useQuery({
    queryKey: CATS_QUERY_KEY,
    queryFn: catsApi.getCats,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
    onMutate: async (updatedCat) => {
      await queryClient.cancelQueries({ queryKey: CATS_QUERY_KEY });
      const previousCats = queryClient.getQueryData<CatResponse[]>(CATS_QUERY_KEY);
      queryClient.setQueryData<CatResponse[]>(CATS_QUERY_KEY, (old = []) =>
        old.map(cat => cat.id === updatedCat.id ? { ...cat, ...updatedCat } : cat)
      );
      return { previousCats };
    },
    onError: (err, updatedCat, context) => {
      if (context?.previousCats) {
        queryClient.setQueryData<CatResponse[]>(CATS_QUERY_KEY, context.previousCats);
      }
      console.error('Failed to update cat:', err);
    },
    // Always refetch after error or success:
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
    },
  });
}