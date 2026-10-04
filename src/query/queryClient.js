import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
      // Always attempt the request: offline, the service worker answers
      // catalog requests from its cache (React Query would otherwise pause
      // every query until the browser reports it's back online).
      networkMode: "offlineFirst",
    },
    mutations: {
      retry: 0,
    },
  },
});

