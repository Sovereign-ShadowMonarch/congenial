import { useEffect, useState } from 'react';
import { QueryDefinition } from '@reduxjs/toolkit/dist/query';
import { UseQuery } from '@reduxjs/toolkit/dist/query/react/buildHooks';

/**
 * Custom hook for conditional fetching with RTK Query
 * Only fetches data when the condition is met
 */
export function useConditionalQuery<
  ResultType,
  QueryArg,
  BaseQuery extends QueryDefinition<any, any, any, ResultType>
>(
  useQueryHook: UseQuery<BaseQuery>,
  arg: QueryArg | undefined,
  condition: boolean,
  options = {}
) {
  // Skip the query if condition is false or arg is undefined
  const result = useQueryHook(arg as any, {
    ...options,
    skip: !condition || arg === undefined,
  });

  return result;
}

/**
 * Custom hook for implementing adaptive polling based on user activity
 * Reduces polling frequency when the tab is not active
 */
export function useAdaptivePolling(
  isActive: boolean,
  defaultInterval = 30000, // 30 seconds default
  backgroundInterval = 300000 // 5 minutes when in background
) {
  const [pollingInterval, setPollingInterval] = useState(defaultInterval);

  useEffect(() => {
    setPollingInterval(isActive ? defaultInterval : backgroundInterval);
  }, [isActive, defaultInterval, backgroundInterval]);

  return pollingInterval;
}

/**
 * Custom hook for implementing pagination with RTK Query
 */
export function usePaginatedQuery<
  ResultType,
  QueryArg extends { page?: number; limit?: number },
  BaseQuery extends QueryDefinition<any, any, any, ResultType>
>(
  useQueryHook: UseQuery<BaseQuery>,
  arg: QueryArg,
  options = {}
) {
  const [page, setPage] = useState(arg.page || 0);
  const [limit, setLimit] = useState(arg.limit || 20);

  // Merge pagination parameters with the original argument
  const paginatedArg = {
    ...arg,
    page,
    limit,
  } as QueryArg;

  // Execute the query with pagination
  const result = useQueryHook(paginatedArg as any, options);

  // Helper functions for pagination control
  const nextPage = () => setPage(prev => prev + 1);
  const prevPage = () => setPage(prev => Math.max(0, prev - 1));
  const goToPage = (newPage: number) => setPage(Math.max(0, newPage));
  const changeLimit = (newLimit: number) => {
    setLimit(newLimit);
    setPage(0); // Reset to first page when changing page size
  };

  return {
    ...result,
    pagination: {
      page,
      limit,
      nextPage,
      prevPage,
      goToPage,
      changeLimit,
    },
  };
}

/**
 * Custom hook for optimistic updates with RTK Query mutations
 */
export function useOptimisticMutation<ResultType, ArgType>(
  useMutationHook: any,
  onOptimisticUpdate: (arg: ArgType) => void,
  onSuccess?: (result: ResultType, arg: ArgType) => void,
  onError?: (error: any, arg: ArgType) => void
) {
  const [trigger, result] = useMutationHook();

  const optimisticTrigger = async (arg: ArgType) => {
    try {
      // Apply optimistic update
      onOptimisticUpdate(arg);
      
      // Perform actual mutation
      const result = await trigger(arg).unwrap();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result, arg);
      }
      
      return result;
    } catch (error) {
      // Call error callback if provided
      if (onError) {
        onError(error, arg);
      }
      
      throw error;
    }
  };

  return [optimisticTrigger, result];
}
