import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface ContactInfoGroupProps {
  title: string;
  leadId: string;
  children: React.ReactNode;
  showEmptyFields?: boolean;
  onToggleEmptyFields?: () => void;
}

export function ContactInfoGroup({
  title,
  leadId,
  children,
  showEmptyFields = true,
  onToggleEmptyFields,
}: ContactInfoGroupProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadGroupState = async () => {
      const { data } = await supabase
        .from("contact_group_states")
        .select("is_collapsed")
        .eq("lead_id", leadId)
        .eq("group_name", title)
        .eq("user_id", user?.id)
        .single();

      if (data) {
        setIsCollapsed(data.is_collapsed);
      }
    };

    if (user?.id) {
      loadGroupState();
    }
  }, [leadId, title, user?.id]);

  const handleToggleCollapse = async () => {
    if (!user?.id) return;
    
    const newState = !isCollapsed;
    setIsCollapsed(newState);

    await supabase
      .from("contact_group_states")
      .upsert({
        user_id: user.id,
        lead_id: leadId,
        group_name: title,
        is_collapsed: newState,
      }, {
        onConflict: "user_id,lead_id,group_name"
      });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleCollapse}
            className="p-0 hover:bg-transparent"
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            )}
          </Button>
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleEmptyFields}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            {showEmptyFields ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                Feld hinzufügen
              </DropdownMenuItem>
              <DropdownMenuItem>
                Reihenfolge ändern
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div
        className={cn(
          "space-y-1 transition-all duration-200",
          isCollapsed ? "hidden" : "block"
        )}
      >
        {children}
      </div>
    </div>
  );
}