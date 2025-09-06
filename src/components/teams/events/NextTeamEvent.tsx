import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, isWithinInterval, formatDistanceToNow, addWeeks, parseISO, isBefore, isAfter, addMonths, addDays, addHours, differenceInDays, startOfDay, endOfDay, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar } from "lucide-react";

interface TeamEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  recurring_pattern?: 'none' | 'daily' | 'weekly' | 'monthly';
  is_admin_only: boolean;
  meeting_link?: string;
  color: string;
}

interface NextTeamEventProps {
  teamId: string;
  teamSlug: string;
}

export function NextTeamEvent({ teamId, teamSlug }: NextTeamEventProps) {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TeamEvent | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const { data: nextEvents = [] } = useQuery({
    queryKey: ["next-team-events", teamId],
    queryFn: async () => {
      const { data: events = [], error } = await supabase
        .from("team_calendar_events")
        .select("*")
        .eq("team_id", teamId)
        .order("start_time");

      if (error) {
        console.error("Error fetching events:", error);
        return [];
      }

      const processedEvents: TeamEvent[] = [];
      const cutoffDate = addMonths(now, 3);
      const today = startOfDay(now);

      events.forEach((event) => {
        const originalStartTime = parseISO(event.start_time);
        const startTimeOfDay = new Date(originalStartTime);
        const hours = originalStartTime.getHours();
        const minutes = originalStartTime.getMinutes();
        
        if (!event.recurring_pattern || event.recurring_pattern === 'none') {
          if (isAfter(originalStartTime, now)) {
            processedEvents.push(event as any);
          }
          return;
        }

        let nextDate = today;
        
        if (isSameDay(today, originalStartTime) && isAfter(originalStartTime, now)) {
          nextDate = originalStartTime;
        } else {
          while (isBefore(nextDate, cutoffDate)) {
            switch (event.recurring_pattern) {
              case 'daily':
                nextDate = addDays(nextDate, 1);
                break;
              case 'weekly':
                if (nextDate.getDay() !== originalStartTime.getDay()) {
                  const daysUntilNext = (originalStartTime.getDay() - nextDate.getDay() + 7) % 7;
                  nextDate = addDays(nextDate, daysUntilNext);
                } else {
                  nextDate = addWeeks(nextDate, 1);
                }
                break;
              case 'monthly':
                nextDate = addMonths(nextDate, 1);
                break;
            }

            nextDate = new Date(nextDate.setHours(hours, minutes, 0, 0));

            if (isAfter(nextDate, now)) {
              break;
            }
          }
        }

        if (isBefore(nextDate, cutoffDate)) {
          const duration = event.end_time 
            ? differenceInDays(parseISO(event.end_time), originalStartTime)
            : 0;

          const recurringEvent = {
            ...event,
            id: `${event.id}-${format(nextDate, 'yyyy-MM-dd')}`,
            start_time: format(nextDate, "yyyy-MM-dd'T'HH:mm:ssxxx"),
            end_time: duration > 0 
              ? format(addDays(nextDate, duration), "yyyy-MM-dd'T'HH:mm:ssxxx")
              : format(addHours(nextDate, 1), "yyyy-MM-dd'T'HH:mm:ssxxx")
          };
          processedEvents.push(recurringEvent as any);
        }
      });

      return processedEvents
        .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime())
        .slice(0, 3);
    },
    refetchInterval: 60000,
  });

  const isEventLive = (event: TeamEvent) => {
    const startTime = parseISO(event.start_time);
    const endTime = event.end_time ? parseISO(event.end_time) : addHours(startTime, 1);
    return isWithinInterval(now, { start: startTime, end: endTime });
  };

  const formatTimeDistance = (date: Date) => {
    return formatDistanceToNow(date, { locale: de, addSuffix: true });
  };

  const handleEventClick = (event: TeamEvent) => {
    setSelectedEvent(event);
    setShowDetails(true);
  };

  const handleCalendarClick = () => {
    navigate(`/unity/team/${teamSlug}/calendar`);
  };

  if (nextEvents.length === 0) return null;

  return (
    <>
      <div className="flex items-center justify-center mt-2 text-muted-foreground">
        <div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer group relative"
             onClick={() => handleEventClick(nextEvents[0])}>
          <Calendar className="h-4 w-4" />
          <span className="text-sm">
            {nextEvents[0].title}
            <span className="ml-1 text-xs opacity-75">
              ({formatTimeDistance(parseISO(nextEvents[0].start_time))})
            </span>
          </span>
          
          {nextEvents.length > 1 && (
            <div className="absolute left-0 top-full mt-2 bg-background/95 backdrop-blur-sm border rounded-md p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 w-64">
              {nextEvents.slice(1).map((event) => (
                <div 
                  key={event.id}
                  className="flex items-center gap-2 py-1 px-2 hover:bg-accent rounded-sm cursor-pointer text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event);
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: event.color || '#FEF7CD' }} />
                  <span>{event.title}</span>
                  <span className="ml-auto opacity-75">
                    {formatTimeDistance(parseISO(event.start_time))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Termin Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedEvent.color || '#FEF7CD' }} />
                  <h4 className="font-medium">{selectedEvent.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(selectedEvent.start_time), "d. MMMM yyyy, HH:mm", { locale: de })} - 
                  {format(selectedEvent.end_time ? parseISO(selectedEvent.end_time) : addHours(parseISO(selectedEvent.start_time), 1), "HH:mm", { locale: de })} Uhr
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTimeDistance(parseISO(selectedEvent.start_time))}
                </p>
              </div>
              {selectedEvent.description && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Beschreibung</h4>
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>
              )}
              {selectedEvent.meeting_link && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Meeting Link</h4>
                  <Button 
                    variant="link" 
                    onClick={() => window.open(selectedEvent.meeting_link)}
                    className="h-8 px-0 text-sm"
                  >
                    Zum Meeting beitreten
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
