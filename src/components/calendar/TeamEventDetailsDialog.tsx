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
import { CalendarDays, Clock, FileText, User } from "lucide-react";

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

  const formatDate = (date: string) => {
    return format(new Date(date), "dd. MMMM yyyy", { locale: de });
  };

  const formatTime = (date: string) => {
    return format(new Date(date), "HH:mm");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Team Termin Details</DialogTitle>
          <DialogDescription>
            Details zum ausgewählten Team Termin
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

          <div className="flex items-start gap-2">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Titel</p>
              <p className="text-sm text-muted-foreground">{event.title}</p>
            </div>
          </div>

          {event.description && (
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Beschreibung</p>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
            </div>
          )}

          {event.created_by && (
            <div className="flex items-start gap-2">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Erstellt von</p>
                <p className="text-sm text-muted-foreground">{event.created_by}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};