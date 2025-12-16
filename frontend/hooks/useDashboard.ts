import { dashboardApi, DashboardResponse } from '@/api/dashboard';
import { useQuery } from '@tanstack/react-query';

export function useDashboardAnalytics() {
  return useQuery<DashboardResponse>({
    queryKey: ['dashboard', 'analytics'],
    queryFn: () => dashboardApi.getAnalytics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}