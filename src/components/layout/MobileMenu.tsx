import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X, LayoutGrid, Users, MessageSquare, Calendar, CheckSquare, BarChart, Settings, FileText, Shield, Globe2, Database, Wrench, Waves } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const personalItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutGrid },
  { name: "Kontakte", path: "/leads", icon: Users },
  { name: "Pool", path: "/pool", icon: Waves },
  { name: "Nachrichten", path: "/messages", icon: MessageSquare },
  { name: "Kalender", path: "/calendar", icon: Calendar },
  { name: "Todo Liste", path: "/todo", icon: CheckSquare },
];

const teamItems = [
  { name: "Unity", path: "/unity", icon: Users },
  { name: "Elevate", path: "/elevate", icon: Users },
];

const analysisItems = [
  { name: "Berichte", path: "/reports", icon: BarChart },
  { name: "Tools", path: "/tools", icon: Wrench },
  { name: "Einstellungen", path: "/settings", icon: Settings },
];

const legalItems = [
  { name: "Impressum", path: "/impressum", icon: FileText },
  { name: "Datenschutz", path: "/privacy-policy", icon: Shield },
  { name: "Datenlöschung", path: "/auth/data-deletion/instagram", icon: Globe2 },
];

const adminItems = [
  { name: "Admin Dashboard", path: "/admin", icon: Database },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const MenuSection = ({ title, items }: { title: string, items: any[] }) => (
    <div className="px-4 py-2">
      <h3 className="text-sm text-white/70 px-4 py-1.5">{title}</h3>
      <div className="space-y-1">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors relative group",
              location.pathname === item.path && "text-white"
            )}
          >
            <item.icon className="h-[25px] w-[25px] shrink-0 group-hover:h-[23px] group-hover:w-[23px] transition-all duration-300" />
            <span>{item.name}</span>
            <div className={cn(
              "absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 transition-all duration-300",
              location.pathname === item.path ? "w-full" : "group-hover:w-full"
            )} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
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
            <MenuSection title="Persönlich" items={personalItems} />
            
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />
            <MenuSection title="Teams & Gruppen" items={teamItems} />
            
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />
            <MenuSection title="Analyse & Tools" items={analysisItems} />
            
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />
            <MenuSection title="Rechtliches" items={legalItems} />
            
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />
            <MenuSection title="Super Admin" items={adminItems} />
          </div>

          <div className="sticky bottom-0 left-0 flex items-center justify-between px-4 py-2 text-sm text-gray-400 border-t border-white/10 bg-[#111111]/80">
            <div className="flex items-center gap-2">
              <span className="text-white">0.31</span>
              <a href="/changelog" className="text-gray-400 hover:text-white transition-colors">
                Changelog
              </a>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}