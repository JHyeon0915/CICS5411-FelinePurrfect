export interface CatRequest {
  name: string;
  photoUri: string | null;
  age: number;
  sex: 'male' | 'female';
  adoptedDate: string; // ISO date string
  weight: number | null;
}

export interface CatResponse {
  id: string;
  name: string;
  photoUri: string | null;
  age: number;
  sex: 'male' | 'female';
  adoptedDate: string; // ISO date string
  weight: number | null;
}