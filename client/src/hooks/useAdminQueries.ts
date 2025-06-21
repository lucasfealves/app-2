
import { useQuery } from "@tanstack/react-query";

export function useAdminStats() {
  return useQuery({
    queryKey: ['/api/admin/stats'],
    retry: false,
  });
}

export function useAdminOrders(filters?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());

  return useQuery({
    queryKey: [`/api/orders?${queryParams.toString()}`],
    retry: false,
  });
}

export function useAdminPayments(filters?: {
  status?: string;
  method?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.method) queryParams.append('method', filters.method);
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());

  return useQuery({
    queryKey: [`/api/payments?${queryParams.toString()}`],
    retry: false,
  });
}

export function useAdminAnalytics(period: string = "30") {
  return useQuery({
    queryKey: [`/api/admin/analytics?period=${period}`],
    retry: false,
  });
}

export function useAdminUsers(filters?: {
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());

  return useQuery({
    queryKey: [`/api/admin/users?${queryParams.toString()}`],
    retry: false,
  });
}
