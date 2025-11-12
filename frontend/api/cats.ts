import { CatRequest, CatResponse } from '@/types/cat';

const API_URL = 'https://your-api.com';

const mockCats: CatResponse[] = [
  {
    id: '1',
    name: 'Luna',
    photoUri: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
    age: 3,
    sex: 'female',
    adoptedDate: new Date('2022-03-15').toISOString(),
    weight: 4.2,
  },
  {
    id: '2',
    name: 'Hobagi',
    photoUri: 'https://unsplash.com/photos/white-kitten-Tn8DLxwuDMA?w=400',
    age: 10,
    sex: 'male',
    adoptedDate: new Date('2025-01-12').toISOString(),
    weight: 6,
  },
];

export const catsApi = {
  // Get all cats
  getCats: async (): Promise<CatResponse[]> => {
    // Mock data for now
   //  const mockCats: CatResponse[] = [];
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
    mockCats.forEach((c, index) => {
      if (c.id === cat.id) {
        mockCats[index] = cat;
      }
    });
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