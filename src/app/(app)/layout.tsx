"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl animate-pulse-neon text-neon-purple font-bold">
          Loading...
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16 pb-20 max-w-lg mx-auto px-4">{children}</main>
    </div>
  );
}
