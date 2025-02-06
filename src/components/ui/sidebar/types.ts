import { LucideIcon } from "lucide-react";
import { ComponentPropsWithoutRef, ElementRef, HTMLAttributes, ReactNode } from "react";
import { VariantProps } from "class-variance-authority";
import { sidebarMenuButtonVariants } from "./variants";

export type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

export interface SidebarProviderProps extends HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface SidebarProps extends ComponentPropsWithoutRef<"div"> {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}

export interface SidebarMenuButtonProps
  extends ComponentPropsWithoutRef<"button">,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | ReactNode;
}

export interface SidebarMenuActionProps extends ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
  showOnHover?: boolean;
}

export interface SidebarMenuSubButtonProps extends ComponentPropsWithoutRef<"a"> {
  asChild?: boolean;
  size?: "sm" | "md";
  isActive?: boolean;
}