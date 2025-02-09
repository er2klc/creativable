
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
      <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/90 px-2 py-2 border-b border-sidebar-border md:hidden">
         <MobileMenu />
          <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
            alt="Logo" 
            className="h-8 w-8"
          />
          <span className="text-sm text-white font-light">creativable</span>
        </div>
      </div>
      <div className={cn(
        "container mx-auto py-4 max-w-full px-4",
        (isLeadsPage || isDashboardPage) ? "pt-24 md:pt-20" : "pt-16 md:py-4"
      )}>
        {children}
      </div>
    </main>
  );
};

