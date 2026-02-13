"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

const pageTitle: Record<string, string> = {
  "/chat": "Chat",
  "/documents": "Documents",
  "/collections": "Collections",
};

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname();

  const title =
    Object.entries(pageTitle).find(([key]) => pathname.startsWith(key))?.[1] ||
    "Dashboard";

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-6">
      <h1 className="text-lg font-semibold">{title}</h1>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </header>
  );
}