import { useQuery } from "@tanstack/react-query";

export function useSiteSettings() {
  return useQuery({
    queryKey: ['/api/site-settings'],
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}