
import * as React from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { SIDEBAR_WIDTH_MOBILE } from "./SidebarContext"

interface MobileSidebarProps extends React.ComponentProps<"div"> {
  open: boolean
  onOpenChange: (open: boolean) => void
  side?: "left" | "right"
}

export const MobileSidebar = React.forwardRef<HTMLDivElement, MobileSidebarProps>(
  ({ children, open, onOpenChange, side = "left", ...props }, ref) => {
    return (
      <Sheet open={open} onOpenChange={onOpenChange} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-mobile="true"
          className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }
)

MobileSidebar.displayName = "MobileSidebar"

