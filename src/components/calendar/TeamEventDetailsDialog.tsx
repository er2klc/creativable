import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TeamEvent } from "./types/calendar";
import { CalendarDays, Clock, FileText, Crown, Rocket, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TeamEventDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: TeamEvent | null;
}

export const TeamEventDetailsDialog = ({
  open,
  onOpenChange,
  event,
}: TeamEventDetailsDialogProps) => {
  if (!event) return null;

  // Fetch creator's display name
  const { data: creatorProfile } = useQuery({
    queryKey: ["profile", event.created_by],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", event.created_by)
        .single();
      return data;
    },
    enabled: !!event.created_by,
  });

  const formatDate = (date: string) => {
    return format(new Date(date), "dd. MMMM yyyy", { locale: de });
  };

  const formatTime = (date: string) => {
    return format(new Date(date), "HH:mm");
  };

  const getEventTypeIcon = () => {
    if (event.is_90_day_run) return <Rocket className="h-5 w-5 text-primary" />;
    if (event.is_admin_only) return <Crown className="h-5 w-5 text-primary" />;
    return <Flame className="h-5 w-5 text-orange-500" />;
  };

  // Function to make URLs in text clickable
  const renderDescriptionWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {getEventTypeIcon()}
              {event.title}
            </DialogTitle>
            {event.is_admin_only && (
              <Badge variant="secondary">Nur für Admins</Badge>
            )}
          </div>
          <DialogDescription>
            Details zum ausgewählten Termin
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="flex items-start gap-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Datum</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(event.start_time)}
                {event.end_date && event.end_date !== event.start_time && (
                  <> bis {formatDate(event.end_date)}</>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Uhrzeit</p>
              <p className="text-sm text-muted-foreground">
                {formatTime(event.start_time)}
                {event.end_time && (
                  <> bis {formatTime(event.end_time)}</>
                )}
              </p>
            </div>
          </div>

          {event.description && (
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Beschreibung</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {renderDescriptionWithLinks(event.description)}
                </p>
              </div>
            </div>
          )}

          {event.created_by && creatorProfile && (
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Erstellt von</p>
                <p className="text-sm text-muted-foreground">
                  {creatorProfile.display_name}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};