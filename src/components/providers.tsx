"use client";

import { SessionProvider } from "next-auth/react";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

// Lightweight Socket context (no actual connection in this simple version)
const SocketCtx = createContext<{ socket: null; connected: boolean }>({ socket: null, connected: false });

function SocketProvider({ children }: { children: ReactNode }) {
  const [connected] = useState(false);
  return <SocketCtx.Provider value={{ socket: null, connected }}>{children}</SocketCtx.Provider>;
}

// Toast context for notifications
interface Toast { id: number; message: string; type: "success" | "error" | "info"; }
const ToastCtx = createContext<{
  toasts: Toast[];
  toast: (m: string, t?: "success" | "error" | "info") => void;
  dismiss: (id: number) => void;
}>({ toasts: [], toast: () => {}, dismiss: () => {} });

let tid = 0;

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = ++tid;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  const dismiss = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  return (
    <ToastCtx.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-20 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm mx-auto">
        {toasts.map((t) => (
          <div key={t.id} onClick={() => dismiss(t.id)} className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 cursor-pointer ${t.type === "error" ? "bg-red-600" : t.type === "success" ? "bg-green-600" : "bg-gray-800"}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useSocket() { return useContext(SocketCtx); }
export function useToast() { return useContext(ToastCtx); }

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SocketProvider>
        <ToastProvider>{children}</ToastProvider>
      </SocketProvider>
    </SessionProvider>
  );
}
