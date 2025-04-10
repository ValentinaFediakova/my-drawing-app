"use client";

import { usePathname } from "next/navigation";
import { ReduxProvider } from "@/components/ReduxProvider";
import { Canvas } from "@/components/Canvas/Canvas";

export default function AllRoutes() {
  const pathname = usePathname();

  console.log("🚦 Current pathname:", pathname);

  return (
    <ReduxProvider>
      {pathname === "/canvas" && <Canvas />}
    </ReduxProvider>
  );
}