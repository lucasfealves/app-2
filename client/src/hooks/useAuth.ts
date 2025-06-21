

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token');
      }

      return apiRequest('/api/auth/user');
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
