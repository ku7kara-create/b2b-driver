"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  toasts: Toast[];
  toast: (message: string, type?: "success" | "error" | "info") => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
});

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-20 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-md mx-auto">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 animate-in slide-in-from-bottom-4 cursor-pointer ${
              t.type === "error" ? "bg-error" : t.type === "success" ? "bg-green-600" : "bg-primary-container"
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {t.type === "error" ? "error" : t.type === "success" ? "check_circle" : "info"}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
