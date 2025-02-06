import { useNavigate } from "react-router-dom";
import { LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSettings } from "@/hooks/use-settings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarFooterProps {
  isExpanded: boolean;
  currentVersion: string;
}

export const SidebarFooter = ({ isExpanded, currentVersion }: SidebarFooterProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { settings } = useSettings();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <>
      <div className="px-3 py-2">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={settings?.avatar_url || "/placeholder.svg"}
                  alt="Avatar"
                />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              {isExpanded && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium leading-none text-white truncate">
                    {settings?.display_name || settings?.email}
                  </p>
                  <p className="text-xs text-white/50 truncate">
                    {settings?.email}
                  </p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="top"
            sideOffset={5}
            className="w-[200px] bg-[#222222] border border-white/10 shadow-lg rounded-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem
              onClick={() => navigate("/settings")}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/5 cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              <span>Einstellungen</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/5 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Abmelden</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Changelog */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-2"></div>
      <div className="flex items-center justify-center px-3 py-2 space-x-2">
        <span className="text-white/70 text-xs">{currentVersion}</span>
        {isExpanded && (
          <a
            href="/changelog"
            className="whitespace-nowrap text-xs text-gray-400 hover:text-white transition-opacity duration-300"
          >
            Changelog
          </a>
        )}
      </div>
    </>
  );
};