import { logsApi } from '@/api/logs';
import { LogResponse } from '@/types/log';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const LOGS_QUERY_KEY = ['logs'];

// Get all logs
export function useLogs() {
  return useQuery({
    queryKey: LOGS_QUERY_KEY,
    queryFn: logsApi.getLogs,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get logs for specific cat
export function useLogsByCat(catId: string) {
  return useQuery({
    queryKey: [...LOGS_QUERY_KEY, 'cat', catId],
    queryFn: () => logsApi.getLogsByCat(catId),
    staleTime: 1000 * 60 * 5,
  });
}

// Add a log
export function useAddLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: logsApi.addLog,
    onSuccess: (newLog) => {
      queryClient.setQueryData<LogResponse[]>(LOGS_QUERY_KEY, (old = []) => [
        ...old,
        newLog,
      ]);
    },
  });
}

// Update a log
export function useUpdateLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: logsApi.updateLog,
    onMutate: async (updatedLog) => {
      await queryClient.cancelQueries({ queryKey: LOGS_QUERY_KEY });
      const previousLogs = queryClient.getQueryData<LogResponse[]>(LOGS_QUERY_KEY);
      
      queryClient.setQueryData<LogResponse[]>(LOGS_QUERY_KEY, (old = []) =>
        old.map(log => log.id === updatedLog.id ? updatedLog : log)
      );
      
      return { previousLogs };
    },
    onError: (err, updatedLog, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(LOGS_QUERY_KEY, context.previousLogs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEY });
    },
  });
}

// Delete a log
export function useDeleteLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: logsApi.deleteLog,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: LOGS_QUERY_KEY });
      const previousLogs = queryClient.getQueryData<LogResponse[]>(LOGS_QUERY_KEY);
      
      queryClient.setQueryData<LogResponse[]>(LOGS_QUERY_KEY, (old = []) =>
        old.filter(log => log.id !== deletedId)
      );
      
      return { previousLogs };
    },
    onError: (err, deletedId, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(LOGS_QUERY_KEY, context.previousLogs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEY });
    },
  });
}