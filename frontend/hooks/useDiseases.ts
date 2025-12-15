// frontend/hooks/useDiseases.ts

import { diseasesApi } from '@/api/diseases';
import { useQuery } from '@tanstack/react-query';

const DISEASES_QUERY_KEY = ['diseases'];

// Get all diseases with optional search
export function useDiseases(searchQuery?: string, category?: string) {
  return useQuery({
    queryKey: [...DISEASES_QUERY_KEY, searchQuery, category],
    queryFn: () => diseasesApi.getDiseases(searchQuery, category),
    staleTime: 1000 * 60 * 30, // 30 minutes (disease data doesn't change often)
  });
}

// Get single disease
export function useDisease(diseaseId: string) {
  return useQuery({
    queryKey: [...DISEASES_QUERY_KEY, diseaseId],
    queryFn: () => diseasesApi.getDisease(diseaseId),
    staleTime: 1000 * 60 * 30,
    enabled: !!diseaseId,
  });
}

// Search diseases
export function useSearchDiseases(query: string) {
  return useQuery({
    queryKey: [...DISEASES_QUERY_KEY, 'search', query],
    queryFn: () => diseasesApi.searchDiseases(query),
    staleTime: 1000 * 60 * 5,
    enabled: query.length > 0,
  });
}