"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Home, FilePlus, Mic, Calendar } from "lucide-react";

export default function ImamLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const navItems = [
    { label: "Dashboard", href: "/imam", icon: Home },
    { label: "New Khutba", href: "/imam/khutba/new", icon: FilePlus },
    { label: "Voice Setup", href: "/imam/voice-setup", icon: Mic },
    { label: "Sessions", href: "/imam/sessions", icon: Calendar },
  ];

  return (
    <div className="flex h-screen bg-[#09090b] text-gray-100">
      <Sidebar items={navItems} activePath={pathname} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
