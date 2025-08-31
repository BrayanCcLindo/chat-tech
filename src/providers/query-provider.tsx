"use client";

import type React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: (failureCount, error) => {
              interface StatusError extends Error {
                status?: number;
              }
              function hasStatus(err: unknown): err is StatusError {
                return (
                  typeof err === "object" && err !== null && "status" in err
                );
              }
              if (error instanceof Error && hasStatus(error)) {
                const status = error.status;
                if (status !== undefined && status >= 400 && status < 500)
                  return false;
              }
              return failureCount < 3;
            }
          },
          mutations: {
            retry: 1
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
