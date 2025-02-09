
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, User, CreditCard, Receipt, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export const MainContent = ({ children, className }: MainContentProps) => {
  const location = useLocation();
  const isLeadsPage = location.pathname === "/leads";
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const getInitials = (email: string) => {
    return email?.charAt(0).toUpperCase() || "U";
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <main className={cn("flex-1 relative", className)}>
      {isMobile ? (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/90 px-2 py-2 border-b border-sidebar-border">
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
      ) : (
        <div className="fixed top-0 right-0 z-50 flex items-center gap-2 p-4 md:left-[72px] transition-[left] duration-300">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => {}} // Add notification handling here
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{getInitials(user?.email || "")}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Plan</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Receipt className="mr-2 h-4 w-4" />
                <span>Rechnung</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Abmelden</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <div className={cn(
        "container mx-auto py-4 max-w-full px-4",
        isLeadsPage ? "pt-16 md:pt-4" : "pt-16 md:py-4"
      )}>
        {isLeadsPage && (
          <div className="flex items-center py-4">
            <h1 className="text-2xl font-semibold">Leads</h1>
          </div>
        )}
        <div className="relative w-full overflow-x-hidden">
          {children}
          {isLeadsPage && (
            <div className="absolute -top-4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent shadow-sm" />
          )}
        </div>
      </div>
    </main>
  );
};
