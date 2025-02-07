
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export const MainContent = ({ children, className }: MainContentProps) => {
  const location = useLocation();
  const isLeadsPage = location.pathname === "/leads";
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const getInitials = (email: string) => {
    return email?.charAt(0).toUpperCase() || "U";
  };

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
        {!isMobile && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>{getInitials(user?.email || "")}</AvatarFallback>
          </Avatar>
        )}
        <MobileMenu />
      </div>
      <div className={cn(
        "container mx-auto py-4",
        isLeadsPage ? "" : "py-4"
      )}>
        {isLeadsPage && (
          <div className="flex items-center py-4">
            <h1 className="text-2xl font-semibold">Leads</h1>
          </div>
        )}
        <div className="relative">
          {children}
          {isLeadsPage && (
            <div className="absolute -top-4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent shadow-sm" />
          )}
        </div>
      </div>
    </main>
  );
};
