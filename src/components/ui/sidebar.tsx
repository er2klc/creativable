import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface SidebarContextValue {
  isOpen: boolean;
  toggle: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue>({
  isOpen: true,
  toggle: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(true);
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function Sidebar({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  const { isOpen } = useSidebar();
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r border-border bg-background transition-transform lg:translate-x-0",
        isOpen && "translate-x-0",
        className
      )}
    >
      {children}
    </aside>
  );
}

export function SidebarTrigger() {
  const { toggle } = useSidebar();
  return (
    <Button variant="outline" size="icon" onClick={toggle} className="lg:hidden">
      <Menu className="h-4 w-4" />
    </Button>
  );
}

export function SidebarContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex h-full flex-col gap-4 p-4", className)}>
      {children}
    </div>
  );
}

export function SidebarGroup({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2", className)}>{children}</div>;
}

export function SidebarGroupLabel({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-2 text-xs font-semibold text-muted-foreground", className)}>
      {children}
    </div>
  );
}

export function SidebarGroupContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1", className)}>{children}</div>;
}

export function SidebarMenu({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1", className)}>{children}</div>;
}

export function SidebarMenuItem({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex", className)}>{children}</div>;
}

type SidebarMenuButtonProps = {
  className?: string;
  children: React.ReactNode;
  asChild?: boolean;
} & (
  | ({ asChild: true } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className">)
  | ({ asChild?: false } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">)
);

export function SidebarMenuButton({
  className,
  children,
  asChild = false,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? "a" : "button";
  return (
    <Comp
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...(props as any)}
    >
      {children}
    </Comp>
  );
}