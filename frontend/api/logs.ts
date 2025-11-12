import { LogRequest, LogResponse } from '@/types/log';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-lambda-url.amazonaws.com';

// Mock data for development
export const mockLogs: LogResponse[] = [
  {
    id: '1',
    catId: '1', // Luna
    date: new Date().toISOString().split('T')[0],
    pooCount: 2,
    peeCount: 3,
    foodCount: 3,
    waterCount: 5,
    weight: 4.2,
    temperature: 38.5,
    notes: 'Very active today',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const USE_MOCK_DATA = true;

export const logsApi = {
  // Get all logs
  getLogs: async (): Promise<LogResponse[]> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [...mockLogs];
    }
    
    const response = await fetch(`${API_URL}/logs`);
    return response.json();
  },

  // Get logs for a specific cat
  getLogsByCat: async (catId: string): Promise<LogResponse[]> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockLogs.filter(log => log.catId === catId);
    }
    
    const response = await fetch(`${API_URL}/logs?catId=${catId}`);
    return response.json();
  },

  // Add a log
  addLog: async (log: LogRequest): Promise<LogResponse> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newLog: LogResponse = {
        ...log,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockLogs.push(newLog);
      return newLog;
    }
    
    const response = await fetch(`${API_URL}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
    return response.json();
  },

  // Update a log
  updateLog: async (log: LogResponse): Promise<LogResponse> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockLogs.findIndex(l => l.id === log.id);
      if (index !== -1) {
        mockLogs[index] = { ...log, updatedAt: new Date().toISOString() };
      }
      return { ...log, updatedAt: new Date().toISOString() };
    }
    
    const response = await fetch(`${API_URL}/logs/${log.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
    return response.json();
  },

  // Delete a log
  deleteLog: async (id: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockLogs.findIndex(log => log.id === id);
      if (index !== -1) {
        mockLogs.splice(index, 1);
      }
      return;
    }
    
    await fetch(`${API_URL}/logs/${id}`, { method: 'DELETE' });
  },
};