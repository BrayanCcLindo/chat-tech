"use client";

import type React from "react";
import { useEffect, useState } from "react";

interface MSWProviderProps {
  children: React.ReactNode;
}

export function MSWProvider({ children }: MSWProviderProps) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    const initMSW = async () => {
      if (typeof window !== "undefined") {
        // Cliente: usar service worker
        const { worker } = await import("@/lib/msw/browser");
        await worker.start({
          onUnhandledRequest: "bypass"
        });
      } else {
        // Servidor: usar setupServer
        const { server } = await import("@/lib/msw/server");
        server.listen({
          onUnhandledRequest: "bypass"
        });
      }
      setMswReady(true);
    };

    if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
      initMSW();
    } else {
      setMswReady(true);
    }
  }, []);

  if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled" && !mswReady) {
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
