export interface CatRequest {
  name: string;
  age: number;
  sex: 'male' | 'female';
  adoptedDate: string; // ISO date string
  weight: number | null;
  breed?: string;
  color?: string;
  microchipId?: string;
  photo?: string; // base64 encoded image
}

export interface CatResponse {
  catId: string;
  userId: string;
  name: string;
  age: number;
  sex: 'male' | 'female';
  adoptedDate: string; // ISO date string
  weight: number | null;
  breed?: string;
  color?: string;
  microchipId?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}