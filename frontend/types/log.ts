export interface LogRequest {
  catId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  pooCount: number;
  peeCount: number;
  foodCount: number;
  waterCount: number;
  weight?: number | null;
  temperature?: number | null;
  notes?: string | null;
}

export interface LogResponse extends LogRequest {
  id: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}