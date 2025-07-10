import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthToken, removeAuthToken, getAuthHeaders } from "@/lib/auth";

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/user/profile"],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) {
        return null;
      }

      const response = await fetch("/api/user/profile", {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          removeAuthToken();
          return null;
        }
        throw new Error("Failed to fetch user");
      }

      return response.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logout = () => {
    removeAuthToken();
    queryClient.clear();
    window.location.href = "/";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    error,
  };
}
