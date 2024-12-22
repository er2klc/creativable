import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Star, Instagram, Linkedin, Facebook, Video } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { useSettings } from "@/hooks/use-settings";

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
    default:
      return null;
  }
};

interface LeadTableViewProps {
  leads: Tables<"leads">[];
  onLeadClick: (id: string) => void;
}

export const LeadTableView = ({ leads, onLeadClick }: LeadTableViewProps) => {
  const { settings } = useSettings();

  const getPhaseTranslation = (phase: string) => {
    const translations: Record<string, Record<string, string>> = {
      de: {
        initial_contact: "Erstkontakt",
        follow_up: "Follow-up",
        closing: "Abschluss",
      },
      en: {
        initial_contact: "Initial Contact",
        follow_up: "Follow-up",
        closing: "Closing",
      },
    };
    return translations[settings?.language || "de"]?.[phase] || phase;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[30px]"></TableHead>
          <TableHead>{settings?.language === "en" ? "Name" : "Name"}</TableHead>
          <TableHead>{settings?.language === "en" ? "Platform" : "Plattform"}</TableHead>
          <TableHead>{settings?.language === "en" ? "Phase" : "Phase"}</TableHead>
          <TableHead>{settings?.language === "en" ? "Last Action" : "Letzte Aktion"}</TableHead>
          <TableHead>{settings?.language === "en" ? "Industry" : "Branche"}</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow
            key={lead.id}
            className="cursor-pointer"
            onClick={() => onLeadClick(lead.id)}
          >
            <TableCell onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-4 w-4">
                <Star className="h-4 w-4" />
              </Button>
            </TableCell>
            <TableCell className="font-medium">{lead.name}</TableCell>
            <TableCell className="flex items-center">
              {getPlatformIcon(lead.platform)}
              {lead.platform}
            </TableCell>
            <TableCell>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  lead.phase === "initial_contact"
                    ? "bg-yellow-100 text-yellow-800"
                    : lead.phase === "follow_up"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {getPhaseTranslation(lead.phase)}
              </span>
            </TableCell>
            <TableCell>
              {lead.last_action_date
                ? new Date(lead.last_action_date).toLocaleDateString(
                    settings?.language === "en" ? "en-US" : "de-DE"
                  )
                : "-"}
            </TableCell>
            <TableCell>{lead.industry}</TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onLeadClick(lead.id)}>
                    {settings?.language === "en" ? "Show Details" : "Details anzeigen"}
                  </DropdownMenuItem>
                  <SendMessageDialog 
                    lead={lead}
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        {settings?.language === "en" ? "Send Message" : "Nachricht senden"}
                      </DropdownMenuItem>
                    }
                  />
                  <DropdownMenuItem>
                    {settings?.language === "en" ? "Change Phase" : "Phase ändern"}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    {settings?.language === "en" ? "Delete" : "Löschen"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};