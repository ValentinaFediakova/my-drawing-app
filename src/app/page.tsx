"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      router.replace("/canvas");
    } else {
      router.replace("/auth");
    }
  }, [router]);

  return null;
}