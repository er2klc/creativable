import { TableCell } from "@/components/ui/table";
import { Star, Instagram, Linkedin, Facebook, Video, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LeadTableCellProps {
  type: "favorite" | "name" | "platform" | "phase" | "lastAction" | "industry";
  value: any;
  onClick?: () => void;
}

const getPlatformIcon = (platform: string) => {
  switch (platform?.toLowerCase()) {
    case "instagram":
      return <Instagram className="h-4 w-4 mr-2" />;
    case "linkedin":
      return <Linkedin className="h-4 w-4 mr-2" />;
    case "facebook":
      return <Facebook className="h-4 w-4 mr-2" />;
    case "tiktok":
      return <Video className="h-4 w-4 mr-2" />;
    case "offline":
      return <Users className="h-4 w-4 mr-2" />;
    default:
      return null;
  }
};

export const LeadTableCell = ({ type, value, onClick }: LeadTableCellProps) => {
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
        <TableCell className="font-medium whitespace-nowrap">{value}</TableCell>
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