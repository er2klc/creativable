
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X, User, CreditCard, Receipt, LogOut, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuSection } from "./mobile-menu/MenuSection";
import { MenuFooter } from "./mobile-menu/MenuFooter";
import { 
  personalItems, 
  teamItems, 
  analysisItems, 
  legalItems, 
  adminItems 
} from "./mobile-menu/menuItems";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationSidebar } from "@/components/notifications/NotificationSidebar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
    refetchInterval: 30000
  });

  const getInitials = (email: string) => {
    return email?.charAt(0).toUpperCase() || "U";
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  useEffect(() => {
    // Close mobile menu when navigating
    const handleRouteChange = () => {
      setOpen(false);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('menu-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white p-0 h-8 w-8">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className={cn(
              "w-[280px] p-0 border-none bg-[#111111] text-white z-[100] overflow-hidden",
              "max-w-[100vw] sheet-content"
            )}
          >
            <div className="flex flex-col h-[100vh] bg-[#111111] overflow-y-auto overflow-x-hidden">
              <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
                <div className="flex items-center gap-4">
                  <img 
                    src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
                    alt="Logo" 
                    className="h-8 w-8"
                  />
                  <span className="text-sm text-white font-light">creativable</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setOpen(false)}
                  className="text-white hover:bg-sidebar-accent"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
                <MenuSection title="Persönlich" items={personalItems} onNavigate={handleNavigation} />
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />
                <MenuSection title="Teams & Gruppen" items={teamItems} onNavigate={handleNavigation} />
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />
                <MenuSection title="Analyse & Tools" items={analysisItems} onNavigate={handleNavigation} />
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />
                <MenuSection title="Rechtliches" items={legalItems} onNavigate={handleNavigation} />
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />
                <MenuSection title="Super Admin" items={adminItems} onNavigate={handleNavigation} />
              </div>

              <MenuFooter />
            </div>
          </SheetContent>
        </Sheet>
        <div 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img 
            src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
            alt="Logo" 
            className="h-8 w-8"
          />
          <span className="text-sm text-white font-light">creativable</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-white relative"
          onClick={() => setNotificationsOpen(true)}
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
          <DropdownMenuContent align="end" className="w-56 z-[200]">
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

      <NotificationSidebar
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </>
  );
}
