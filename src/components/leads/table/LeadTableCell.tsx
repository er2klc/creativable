import { TableCell } from "@/components/ui/table";
import { Star, Instagram, Linkedin, Facebook, Video, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";

interface LeadTableCellProps {
  type: "favorite" | "name" | "platform" | "phase" | "lastAction" | "industry";
  value: any;
  onClick?: () => void;
  lead?: Tables<"leads">; // Properly typed lead prop
}

const getPlatformIcon = (platform: string) => {
  switch (platform?.toLowerCase()) {
    case "instagram":
      return <Instagram className="h-4 w-4 text-white" />;
    case "linkedin":
      return <Linkedin className="h-4 w-4 text-white" />;
    case "facebook":
      return <Facebook className="h-4 w-4 text-white" />;
    case "tiktok":
      return <Video className="h-4 w-4 text-white" />;
    case "offline":
      return <Users className="h-4 w-4 text-white" />;
    default:
      return null;
  }
};

const getPlatformColor = (platform: string) => {
  switch (platform?.toLowerCase()) {
    case "instagram":
      return "bg-gradient-to-br from-purple-600 to-pink-500";
    case "linkedin":
      return "bg-blue-600";
    case "facebook":
      return "bg-blue-700";
    case "tiktok":
      return "bg-black";
    default:
      return "bg-gray-500";
  }
};

export const LeadTableCell = ({ type, value, onClick, lead }: LeadTableCellProps) => {
  const { data: phaseInfo } = useQuery({
    queryKey: ["phase-info", value],
    queryFn: async () => {
      if (type !== "phase" || !value) return null;
      
      const { data: phase } = await supabase
        .from("pipeline_phases")
        .select("*, pipelines(name)")
        .eq("id", value)
        .maybeSingle();
      
      return phase;
    },
    enabled: type === "phase" && !!value,
  });

  switch (type) {
    case "favorite":
      return (
        <TableCell className="p-2" onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}>
          <Button variant="ghost" size="icon" className="h-4 w-4">
            <Star className="h-4 w-4" />
          </Button>
        </TableCell>
      );
    case "platform":
      return (
        <TableCell className="whitespace-nowrap">
          <div className="flex items-center gap-2">
            {getPlatformIcon(value)}
            <span>{value}</span>
          </div>
        </TableCell>
      );
    case "phase":
      return (
        <TableCell className="whitespace-nowrap">
          {phaseInfo ? `${phaseInfo.pipelines.name} > ${phaseInfo.name}` : "..."}
        </TableCell>
      );
    case "name":
      return (
        <TableCell className="font-medium whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-8 w-8">
                {lead?.social_media_profile_image_url ? (
                  <AvatarImage 
                    src={lead.social_media_profile_image_url} 
                    alt={value}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback>
                    {value?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className={cn(
                "absolute -right-1 -top-1 rounded-full w-5 h-5 border-2 border-white shadow-lg flex items-center justify-center",
                getPlatformColor(lead?.platform)
              )}>
                {getPlatformIcon(lead?.platform)}
              </div>
            </div>
            <span>{value}</span>
          </div>
        </TableCell>
      );
    case "lastAction":
      return (
        <TableCell className="whitespace-nowrap">
          {value ? new Date(value).toLocaleDateString() : "-"}
        </TableCell>
      );
    default:
      return <TableCell className="whitespace-nowrap">{value}</TableCell>;
  }
};