import { LogRequest, LogResponse } from '@/types/log';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;
const TOKEN_KEY = 'auth_token';

// Helper to get auth token
async function getAuthToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export const logsApi = {
  // Get all logs (possibly with catId query param)
  getLogs: async (catId?: string): Promise<LogResponse[]> => {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const url = catId 
      ? `${API_URL}/logs?catId=${catId}`
      : `${API_URL}/logs`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.log('Error fetching logs:', result);
      throw {
        code: result.code || 'GetLogsError',
        message: result.message || 'Failed to fetch logs',
      };
    }

    return result.logs || [];
  },

  // Add a log
  addLog: async (log: LogRequest): Promise<LogResponse> => {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(log),
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        code: result.code || 'AddLogError',
        message: result.message || 'Failed to add log',
      };
    }

    return result.log;
  },

  // Update a log
  updateLog: async (log: LogResponse): Promise<LogResponse> => {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/logs/${log.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(log),
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        code: result.code || 'UpdateLogError',
        message: result.message || 'Failed to update log',
      };
    }

    return result.log;
  },

  // Delete a log
  deleteLog: async (id: string): Promise<void> => {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/logs/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const result = await response.json();
      throw {
        code: result.code || 'DeleteLogError',
        message: result.message || 'Failed to delete log',
      };
    }
  },

  // Get single log
  getLog: async (id: string): Promise<LogResponse> => {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/logs/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        code: result.code || 'GetLogError',
        message: result.message || 'Failed to fetch log',
      };
    }

    return result.log;
  },
};