import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;
const TOKEN_KEY = 'auth_token';

async function getAuthToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export interface CatAnalysis {
  catId: string;
  catName: string;
  breed: string;
  averageWeight: string | null;
  averageTemperature: string | null;
  appetiteTrend: string | null;
  energyTrend: string | null;
  averagePooCount: string | null;
  averagePeeCount: string | null;
  averageFoodCount: string | null;
  averageWaterCount: string | null;
  healthIssues: string[];
  totalLogs: number;
}

export interface DashboardResponse {
  totalCats: number;
  analysis: CatAnalysis[];
}

export const dashboardApi = {
  getAnalytics: async (): Promise<DashboardResponse> => {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/dashboard/analytics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Failed to fetch analytics:', result);
      throw {
        code: result.code || 'DashboardError',
        message: result.message || 'Failed to load analytics',
      };
    }

    return result;
  },
};