
import * as React from "react"
import { useSidebar } from "./SidebarContext"
import { StaticSidebar } from "./StaticSidebar"
import { MobileSidebar } from "./MobileSidebar"
import { DesktopSidebar } from "./DesktopSidebar"

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    if (collapsible === "none") {
      return (
        <StaticSidebar 
          ref={ref} 
          className={className} 
          {...props}
        >
          {children}
        </StaticSidebar>
      )
    }

    if (isMobile) {
      return (
        <MobileSidebar
          ref={ref}
          open={openMobile}
          onOpenChange={setOpenMobile}
          side={side}
          {...props}
        >
          {children}
        </MobileSidebar>
      )
    }

    return (
      <DesktopSidebar
        ref={ref}
        className={className}
        side={side}
        variant={variant}
        state={state}
        collapsible={collapsible}
        {...props}
      >
        {children}
      </DesktopSidebar>
    )
  }
)

Sidebar.displayName = "Sidebar"

