
import { cn } from "@/lib/utils"

export const getSidebarStyles = {
  base: "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
  
  desktop: {
    wrapper: "group peer hidden md:block text-sidebar-foreground",
    placeholder: "pointer-events-none duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear group-data-[collapsible=offcanvas]:w-0 group-data-[side=right]:rotate-180",
    content: "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",
    inner: "flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
  },

  variants: {
    floating: "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]",
    default: "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l"
  },

  sides: {
    left: "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]",
    right: "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]"
  }
}

