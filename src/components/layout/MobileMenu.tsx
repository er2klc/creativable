
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
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

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const getInitials = (email: string) => {
    return email?.charAt(0).toUpperCase() || "U";
  };

  // Subscribe to real-time updates for unread messages count
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
          // Invalidate the unread messages query to trigger a refetch
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
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2">
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback>{getInitials(user?.email || "")}</AvatarFallback>
        </Avatar>
      </div>
      <SheetContent 
        side="top" 
        className="w-full p-0 border-none bg-[#111111] text-white"
      >
        <div className="flex flex-col h-[95vh] bg-[#111111] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
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
          
          <div className="flex-1 overflow-y-auto no-scrollbar">
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
  );
}
