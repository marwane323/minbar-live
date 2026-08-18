import * as React from "react"
import { cn } from "@/lib/utils"

export interface RTLTextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  as?: React.ElementType
}

export function RTLText({
  children,
  className,
  as: Component = "span",
  ...props
}: RTLTextProps) {
  return (
    <Component
      dir="rtl"
      className={cn("font-arabic text-right", className)}
      {...props}
    >
      {children}
    </Component>
  )
}
