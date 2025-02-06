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

export const SidebarFooter = ({ isExpanded }: SidebarFooterProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
   <div className="sticky bottom-0 w-full p-3 bg-[#111111]/80 border-t border-white/10">
  <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
    <DropdownMenuTrigger className="w-full focus:outline-none">
      <div
        className={`flex items-center gap-3 p-2 rounded-md transition-colors group cursor-pointer hover:bg-sidebar-accent ${
          isExpanded ? "justify-start" : "justify-center"
        }`}
      >
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
          <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        {isExpanded && (
          <div className="flex flex-col items-start">
            <span className="text-sm text-white/80">
              {user?.user_metadata?.display_name || user?.email}
            </span>
          </div>
        )}
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      side="top"
      className="w-56 bg-sidebar-background border border-sidebar-border"
    >
      <DropdownMenuItem onClick={() => navigate("/settings")} className="text-white hover:bg-sidebar-accent">
        <Settings className="mr-2 h-4 w-4" />
        <span>Profil</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => navigate("/plan")} className="text-white hover:bg-sidebar-accent">
        <User className="mr-2 h-4 w-4" />
        <span>Plan</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => navigate("/billing")} className="text-white hover:bg-sidebar-accent">
        <CreditCard className="mr-2 h-4 w-4" />
        <span>Rechnung</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleSignOut} className="text-white hover:bg-sidebar-accent">
        <LogOut className="mr-2 h-4 w-4" />
        <span>Abmelden</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>
  );
};
