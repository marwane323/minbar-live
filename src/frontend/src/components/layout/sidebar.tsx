import * as React from "react"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SidebarItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface SidebarProps {
  items: SidebarItem[]
  activePath: string
}

export function Sidebar({ items, activePath }: SidebarProps) {
  return (
    <div className="flex h-screen w-64 flex-col bg-[#121214] border-r border-zinc-800">
      <div className="flex h-16 shrink-0 items-center px-6">
        <span className="text-xl font-semibold tracking-tight text-gray-100 flex items-center gap-2">
          🕌 Minbar Live
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
        {items.map((item) => {
          const isActive = activePath === item.href || activePath.startsWith(item.href + "/")
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-amber-500/10 text-amber-500"
                  : "text-gray-400 hover:bg-[#1a1a1e] hover:text-gray-100"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 shrink-0",
                  isActive ? "text-amber-500" : "text-gray-500 group-hover:text-gray-300"
                )}
                aria-hidden="true"
              />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
