import { CatRequest, CatResponse } from '@/types/cat';
import { File } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;
const TOKEN_KEY = 'access_token';

// Helper to get auth token
async function getAccessToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

// Helper to convert image URI to base64 using new File API
async function imageUriToBase64(uri: string): Promise<string> {
  try {
    const file = new File(uri);
    const base64 = await file.base64();
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Failed to convert image to base64:', error);
    throw new Error('Failed to process image');
  }
}

export const catsApi = {
  // Get all cats
  getCats: async (): Promise<CatResponse[]> => {
    const token = await getAccessToken();
    
    if (!token) {
      console.log('No auth token found');
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/cats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Failed to fetch cats:', result);
      throw {
        code: result.code || 'GetCatsError',
        message: result.message || 'Failed to fetch cats',
      };
    }

    return result.cats || [];
  },

  // Add a cat
  addCat: async (cat: CatRequest): Promise<CatResponse> => {
    const token = await getAccessToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    // Convert photo URI to base64 if exists
    let photoBase64;
    if (cat.photo) {
      photoBase64 = await imageUriToBase64(cat.photo);
    }

    const response = await fetch(`${API_URL}/cats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: cat.name,
        age: cat.age,
        sex: cat.sex,
        adoptedDate: cat.adoptedDate,
        weight: cat.weight,
        breed: cat.breed,
        color: cat.color,
        microchipId: cat.microchipId,
        photo: photoBase64,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        code: result.code || 'AddCatError',
        message: result.message || 'Failed to add cat',
      };
    }

    return result.cat;
  },

  // Update a cat
  updateCat: async (cat: CatResponse & { photo?: string }): Promise<CatResponse> => {
    const token = await getAccessToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    // Convert photo URI to base64 if it's a new local image
    let photoBase64;
    if (cat.photo && !cat.photo.startsWith('http')) {
      photoBase64 = await imageUriToBase64(cat.photo);
    }

    const response = await fetch(`${API_URL}/cats/${cat.catId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: cat.name,
        age: cat.age,
        sex: cat.sex,
        adoptedDate: cat.adoptedDate,
        weight: cat.weight,
        breed: cat.breed,
        color: cat.color,
        microchipId: cat.microchipId,
        photo: photoBase64,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        code: result.code || 'UpdateCatError',
        message: result.message || 'Failed to update cat',
      };
    }

    return result.cat;
  },

  // Delete a cat
  deleteCat: async (catId: string): Promise<void> => {
    const token = await getAccessToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/cats/${catId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const result = await response.json();
      throw {
        code: result.code || 'DeleteCatError',
        message: result.message || 'Failed to delete cat',
      };
    }
  },

  // Get single cat
  getCat: async (catId: string): Promise<CatResponse> => {
    const token = await getAccessToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/cats/${catId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        code: result.code || 'GetCatError',
        message: result.message || 'Failed to fetch cat',
      };
    }

    return result.cat;
  },
};