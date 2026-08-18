"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  CreditCard,
  Palette,
} from "lucide-react";

// Assuming we have a Sidebar component exported from here
// In a real project we would use the exact exported sidebar component, but the prompt gave us the signature.
import { Sidebar } from "@/components/layout/sidebar";

const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Sessions", href: "/admin/sessions", icon: Calendar },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Billing", href: "/admin/billing", icon: CreditCard },
  { label: "Branding", href: "/admin/branding", icon: Palette },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/admin";

  return (
    <div className="flex h-screen bg-[#09090b] text-gray-100 font-sans">
      <Sidebar items={adminNavItems} activePath={pathname} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
