import { CatRequest, CatResponse } from '@/types/cat';

const API_URL = 'https://your-api.com';

export const catsApi = {
  // Get all cats
  getCats: async (): Promise<CatResponse[]> => {
    // Mock data for now
    const mockCats: CatResponse[] = [];
    return mockCats;
    
    // const response = await fetch(`${API_URL}/cats`);
    // return response.json();
  },

  // Add a cat
  addCat: async (cat: CatRequest): Promise<CatResponse> => {
    // Mock - generate ID locally
    const newCat: CatResponse = {
      ...cat,
      id: Date.now().toString(),
    };
    return newCat;
    
    // const response = await fetch(`${API_URL}/cats`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(cat),
    // });
    // return response.json();
  },

  // Update a cat
  updateCat: async (cat: CatResponse): Promise<CatResponse> => {
    return cat;
    
    // const response = await fetch(`${API_URL}/cats/${cat.id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(cat),
    // });
    // return response.json();
  },

  // Delete a cat
  deleteCat: async (id: string): Promise<void> => {
    // await fetch(`${API_URL}/cats/${id}`, { method: 'DELETE' });
  },
};