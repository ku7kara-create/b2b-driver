"use client";

import { SessionProvider } from "next-auth/react";
import { SocketProvider } from "@/hooks/use-socket";
import { ToastProvider } from "@/hooks/use-toast";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SocketProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </SocketProvider>
    </SessionProvider>
  );
}
