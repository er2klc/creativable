
import * as React from "react"
import { cn } from "@/lib/utils"
import { getSidebarStyles } from "./styles"

interface StaticSidebarProps extends React.ComponentProps<"div"> {
  className?: string
}

export const StaticSidebar = React.forwardRef<HTMLDivElement, StaticSidebarProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn(getSidebarStyles.base, className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

StaticSidebar.displayName = "StaticSidebar"

