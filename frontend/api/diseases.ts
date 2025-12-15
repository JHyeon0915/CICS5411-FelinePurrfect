import { DiseaseResponse } from '@/types/disease';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

export const diseasesApi = {
  // Get all diseases (with optional search and category filter)
  getDiseases: async (searchQuery?: string, category?: string): Promise<DiseaseResponse[]> => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (category) params.append('category', category);
    
    const url = params.toString() 
      ? `${API_URL}/diseases?${params.toString()}`
      : `${API_URL}/diseases`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        code: result.code || 'GetDiseasesError',
        message: result.message || 'Failed to fetch diseases',
      };
    }

    return result.diseases || [];
  },

  // Get single disease
  getDisease: async (id: string): Promise<DiseaseResponse> => {
    const response = await fetch(`${API_URL}/diseases/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        code: result.code || 'GetDiseaseError',
        message: result.message || 'Failed to fetch disease',
      };
    }

    return result.disease;
  },

  // Search diseases
  searchDiseases: async (query: string): Promise<DiseaseResponse[]> => {
    return diseasesApi.getDiseases(query);
  },
};