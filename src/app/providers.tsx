"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  // SessionProvider 用于在整个应用中提供 next-auth 的会话（session）上下文。
  // 这样，子组件就可以通过 useSession() 等 Hook 访问用户登录状态。
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}