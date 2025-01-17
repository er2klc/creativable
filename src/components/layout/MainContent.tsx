import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";
import { useLocation } from "react-router-dom";

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export const MainContent = ({ children, className }: MainContentProps) => {
  const location = useLocation();
  const isLeadsPage = location.pathname === "/leads";

  return (
    <main className={cn("flex-1 relative", className)}>
      <div className="sticky top-0 z-40 flex items-center justify-between bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/90 px-2 py-2 border-b border-sidebar-border md:hidden">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
            alt="Logo" 
            className="h-8 w-8"
          />
          <span className="text-sm text-white font-light">creativable</span>
        </div>
        <MobileMenu />
      </div>
      <div className={cn(
        "mx-auto p-2 md:p-8",
        isLeadsPage ? "w-full max-w-none" : "max-w-7xl"
      )}>
        {children}
      </div>
    </main>
  );
};