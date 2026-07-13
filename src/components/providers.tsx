"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

function SafeSocketProvider({ children }: { children: ReactNode }) {
  const { createContext: c, useContext: u, useEffect, useState } = require("react");
  const SocketCtx = c({ socket: null, connected: false });

  function Inner({ children: ch }: { children: ReactNode }) {
    const [state] = useState({ socket: null, connected: false });
    return ch;
  }

  return <Inner>{children}</Inner>;
}

function SafeToastProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
