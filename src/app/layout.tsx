import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { MSWProvider } from "@/providers/msw-provider";
import { QueryProvider } from "@/providers/query-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "App de Mensajes",
  description: "Aplicación de mensajes con Next.js 15"
};
export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={null}>
          <QueryProvider>
            <MSWProvider>{children}</MSWProvider>
          </QueryProvider>
        </Suspense>
      </body>
    </html>
  );
}
