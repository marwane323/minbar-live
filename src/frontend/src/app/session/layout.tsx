"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { List, Mic, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

export default function SessionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const navItems = [
    { label: "Sessions", href: "/session", icon: List },
  ];

  return (
    <div className="flex h-screen bg-[#09090b] text-gray-100">
      <Sidebar items={navItems} activePath={pathname} />
      <main className="flex-1 overflow-auto flex flex-col">
        {children}
      </main>
    </div>
  );
}
