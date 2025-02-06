
import * as React from "react"
import { cn } from "@/lib/utils"
import { getSidebarStyles } from "./styles"

interface DesktopSidebarProps extends React.ComponentProps<"div"> {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  state: string
  collapsible?: "offcanvas" | "icon" | "none"
}

export const DesktopSidebar = React.forwardRef<HTMLDivElement, DesktopSidebarProps>(
  ({ 
    children, 
    className,
    side = "left",
    variant = "sidebar",
    state,
    collapsible,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(getSidebarStyles.desktop.wrapper, className)}
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
        {...props}
      >
        <div
          className={cn(
            getSidebarStyles.desktop.placeholder,
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"
          )}
        />
        <div
          className={cn(
            getSidebarStyles.desktop.content,
            getSidebarStyles.sides[side],
            (variant === "floating" || variant === "inset")
              ? getSidebarStyles.variants.floating
              : getSidebarStyles.variants.default
          )}
        >
          <div
            data-sidebar="sidebar"
            className={getSidebarStyles.desktop.inner}
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
)

DesktopSidebar.displayName = "DesktopSidebar"

