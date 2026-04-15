/**
 * React Hooks for API Integration
 * Hooks để sử dụng API services trong React components
 */

import { useCallback, useState } from "react";
import type { ApiResponse } from "./http";

/**
 * Generic hook cho async API calls
 */
export function useApiCall<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFunction(...args);
        if (response.success && response.data) {
          setData(response.data);
          return response.data;
        } else {
          const errorMsg =
            response.error?.message || "Có lỗi xảy ra";
          setError(errorMsg);
          throw new Error(errorMsg);
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Network error";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return { data, error, loading, execute };
}

/**
 * Hook để quản lý form submission
 */
export function useSubmit<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = useCallback(
    async (...args: any[]) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const response = await apiFunction(...args);
        if (response.success) {
          return response.data;
        } else {
          const errorMsg =
            response.error?.message || "Có lỗi xảy ra";
          setSubmitError(errorMsg);
          throw new Error(errorMsg);
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Network error";
        setSubmitError(errorMsg);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [apiFunction]
  );

  const clearError = useCallback(() => {
    setSubmitError(null);
  }, []);

  return { isSubmitting, submitError, submit, clearError };
}

/**
 * Hook để fetch data (với caching bằng React Query nếu có)
 */
export function useFetchData<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  args: any[] = [],
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFunction(...args);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        const errorMsg =
          response.error?.message || "Có lỗi xảy ra";
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Network error";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction, args]);

  // Auto fetch when component mounts or dependencies change
  const React = require("react");
  React.useEffect(() => {
    if (enabled) {
      refetch();
    }
  }, [refetch, enabled]);

  return { data, error, isLoading, refetch };
}

