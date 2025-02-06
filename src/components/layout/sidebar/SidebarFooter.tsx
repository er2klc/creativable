import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogOut, CreditCard, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SidebarFooterProps {
  isExpanded: boolean;
  currentVersion: string;
}

export const SidebarFooter = ({ isExpanded, currentVersion }: SidebarFooterProps) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Erfolgreich abgemeldet");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Fehler beim Abmelden");
    }
  };

  return (
    <div className={cn(
      "sticky bottom-0 left-0 flex flex-col gap-2 px-4 py-2 text-sm text-gray-400 border-t border-white/10 bg-[#111111]/80 transition-all duration-300",
      isExpanded ? "w-full" : "w-[72px]"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white">{currentVersion}</span>
          {isExpanded && (
            <a href="/changelog" className="whitespace-nowrap text-gray-400 hover:text-white transition-opacity duration-300">
              Changelog
            </a>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full p-2 flex items-center gap-2 hover:bg-white/5">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            {isExpanded && (
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white truncate">
                  {profile?.display_name || user?.email}
                </p>
                {profile?.is_super_admin && (
                  <p className="text-xs text-muted-foreground">Super Admin</p>
                )}
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Einstellungen
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/billing")}>
            <CreditCard className="mr-2 h-4 w-4" />
            Rechnung
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/plan")}>
            <User className="mr-2 h-4 w-4" />
            Plan
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Abmelden
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};