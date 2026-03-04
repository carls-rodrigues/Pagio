"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { SignOutButton } from "@/features/auth/components/SignOutButton";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/sign-in");
    }
  }, [status, router]);

  if (status === "loading") return null;
  if (status === "unauthenticated") return null;

  return (
    <>
      <header>
        <SignOutButton />
      </header>
      {children}
    </>
  );
}
