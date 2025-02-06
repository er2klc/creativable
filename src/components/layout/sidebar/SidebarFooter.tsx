import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreditCard, LogOut, Settings, User } from "lucide-react";
import { useState } from "react";

interface SidebarFooterProps {
  isExpanded: boolean;
  currentVersion: string;
}

export const SidebarFooter = ({ isExpanded, currentVersion }: SidebarFooterProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="p-2 border-t border-sidebar-border">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger className="w-full focus:outline-none" onClick={(e) => e.stopPropagation()}>
              <div className={`flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-sidebar-accent group cursor-pointer ${isExpanded ? 'justify-start' : 'justify-center'}`}>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                {isExpanded && (
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-white">
                      {user?.user_metadata?.display_name || user?.email}
                    </span>
                    <span className="text-xs text-gray-400">v{currentVersion}</span>
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-sidebar-background border border-sidebar-border"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem onClick={() => navigate("/settings")} className="text-white hover:bg-sidebar-accent focus:bg-sidebar-accent">
                <Settings className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/plan")} className="text-white hover:bg-sidebar-accent focus:bg-sidebar-accent">
                <User className="mr-2 h-4 w-4" />
                <span>Plan</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/billing")} className="text-white hover:bg-sidebar-accent focus:bg-sidebar-accent">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Rechnung</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-white hover:bg-sidebar-accent focus:bg-sidebar-accent">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Abmelden</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};