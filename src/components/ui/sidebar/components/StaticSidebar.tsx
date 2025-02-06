
import { cn } from "@/lib/utils"
import * as React from "react"

interface StaticSidebarProps extends React.ComponentProps<"div"> {
  className?: string;
  children?: React.ReactNode;
}

export const StaticSidebar = React.forwardRef<HTMLDivElement, StaticSidebarProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

StaticSidebar.displayName = "StaticSidebar"
