"use client";

import type React from "react";

import { useEffect, useState } from "react";

interface MSWProviderProps {
  children: React.ReactNode;
}

export function MSWProvider({ children }: MSWProviderProps) {
  const [isMSWReady, setIsMSWReady] = useState(false);

  useEffect(() => {
    const initMSW = async () => {
      if (typeof window !== "undefined") {
        const { worker } = await import("../lib/msw/browser");

        await worker.start({
          onUnhandledRequest: "bypass"
        });

        setIsMSWReady(true);
      }
    };

    if (process.env.NODE_ENV === "development") {
      initMSW();
    } else {
      setIsMSWReady(true);
    }
  }, []);

  if (!isMSWReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Iniciando MSW...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
