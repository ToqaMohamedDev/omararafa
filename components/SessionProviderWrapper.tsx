"use client";

import { SessionProvider } from "@/hooks/useSession";
import { ReactNode } from "react";

export function SessionProviderWrapper({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

