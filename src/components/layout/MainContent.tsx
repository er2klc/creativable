
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export const MainContent = ({ children, className }: MainContentProps) => {
  const location = useLocation();
  const isLeadsPage = location.pathname === "/leads";
  const isDashboardPage = location.pathname === "/";
  const isMobile = useIsMobile();

  return (
    <main className={cn("flex-1 relative", className)}>
      <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/90 px-4 py-2 border-b border-sidebar-border md:hidden h-16">
        <MobileMenu />
      </div>
      <div className={cn(
        "container mx-auto py-4 max-w-full px-4",
        isDashboardPage ? "pt-40 md:pt-[84px]" : "pt-20 md:pt-[84px]"
      )}>
        {children}
      </div>
    </main>
  );
};
