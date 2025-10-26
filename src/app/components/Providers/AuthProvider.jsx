"use client";

import { SessionProvider}

export default function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
