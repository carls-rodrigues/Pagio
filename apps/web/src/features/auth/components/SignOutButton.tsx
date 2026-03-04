"use client";

import { useRouter } from "next/navigation";
import { useSignOut } from "../hooks/useSignOut";

export function SignOutButton() {
  const { signOut, isLoading } = useSignOut();
  const router = useRouter();

  async function handleClick() {
    await signOut();
    router.replace("/sign-in");
  }

  return (
    <button onClick={handleClick} disabled={isLoading}>
      Sign out
    </button>
  );
}
