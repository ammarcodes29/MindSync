import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { User } from "@shared/schema";

type UserResponse = User | null;

/**
 * Custom hook for accessing and managing the current user
 */
export function useUser() {
  const [_, navigate] = useLocation();
  const [isInitiallyLoading, setIsInitiallyLoading] = useState(true);
  
  const { 
    data: user, 
    isLoading,
    isError,
    refetch,
  } = useQuery<UserResponse>({ 
    queryKey: ["/api/auth/session"],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Set initial loading state
  useEffect(() => {
    if (!isLoading) {
      setIsInitiallyLoading(false);
    }
  }, [isLoading]);
  
  // Check if user is authenticated
  const isAuthenticated = !!user;
  
  // Redirect to login if not authenticated
  const requireAuth = (redirectTo = "/login") => {
    if (!isInitiallyLoading && !isLoading && !isAuthenticated) {
      navigate(redirectTo);
      return false;
    }
    return true;
  };
  
  // Redirect to dashboard if already authenticated
  const requireGuest = (redirectTo = "/dashboard") => {
    if (!isInitiallyLoading && !isLoading && isAuthenticated) {
      navigate(redirectTo);
      return false;
    }
    return true;
  };
  
  return {
    user,
    isLoading: isLoading || isInitiallyLoading,
    isError,
    isAuthenticated,
    refetch,
    requireAuth,
    requireGuest,
  };
}
