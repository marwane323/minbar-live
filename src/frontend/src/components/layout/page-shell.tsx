import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageShellProps {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function PageShell({
  title,
  description,
  actions,
  children,
  className,
}: PageShellProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#09090b]">
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-[#09090b]/95 backdrop-blur px-8 py-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-100">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-gray-400">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-4">{actions}</div>
        )}
      </header>
      <main className={cn("flex-1 overflow-y-auto p-8", className)}>
        {children}
      </main>
    </div>
  )
}
