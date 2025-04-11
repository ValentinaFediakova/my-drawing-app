"use client";

import { usePathname } from "next/navigation";
import { ReduxProvider } from "@/components/ReduxProvider";
import { CanvasPage } from "@/components/Canvas/Canvas";
import { AuthorizationPage } from '@/components/Authorization/Authorization'

export default function AllRoutes() {
  const pathname = usePathname();

  return (
    <ReduxProvider>
      {pathname === "/canvas" && <CanvasPage />}
      {pathname === "/auth" && <AuthorizationPage />}
    </ReduxProvider>
  );
}