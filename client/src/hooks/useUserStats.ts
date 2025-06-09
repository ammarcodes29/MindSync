import { useQuery, useMutation } from "@tanstack/react-query";
import { UserStats } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

/**
 * Custom hook for accessing and updating user statistics
 */
export function useUserStats() {
  const { toast } = useToast();
  
  const {
    data: stats,
    isLoading,
    error,
    refetch
  } = useQuery<UserStats>({
    queryKey: ["/api/user-stats"],
    staleTime: 60 * 1000, // 1 minute
  });
  
  const updateStatsMutation = useMutation({
    mutationFn: async (updatedStats: Partial<UserStats>) => {
      const res = await apiRequest("PUT", "/api/user-stats", updatedStats);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-stats"] });
      toast({
        title: "Stats updated",
        description: "Your study statistics have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update stats",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  return {
    stats,
    isLoading,
    error,
    refetch,
    updateStats: updateStatsMutation.mutate,
    isUpdating: updateStatsMutation.isPending,
  };
}