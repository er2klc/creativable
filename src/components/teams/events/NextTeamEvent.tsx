
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, isWithinInterval, formatDistanceToNow, addWeeks, parseISO, isBefore, isAfter, addMonths, addDays, addHours, differenceInDays, startOfDay, endOfDay, isSameDay } from "date-fns";
import { de } from "date-fns/locale";

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

  // Update current time every minute
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
      const cutoffDate = addMonths(now, 3); // Look ahead 3 months maximum
      const today = startOfDay(now);

      events.forEach((event) => {
        const originalStartTime = parseISO(event.start_time);
        const startTimeOfDay = new Date(originalStartTime);
        const hours = originalStartTime.getHours();
        const minutes = originalStartTime.getMinutes();
        
        // For non-recurring events
        if (!event.recurring_pattern || event.recurring_pattern === 'none') {
          if (isAfter(originalStartTime, now)) {
            processedEvents.push(event);
          }
          return;
        }

        // For recurring events, find the next occurrence
        let nextDate = today;
        
        // If today's event hasn't happened yet, consider today
        if (isSameDay(today, originalStartTime) && isAfter(originalStartTime, now)) {
          nextDate = originalStartTime;
        } else {
          // Find the next occurrence based on pattern
          while (isBefore(nextDate, cutoffDate)) {
            switch (event.recurring_pattern) {
              case 'daily':
                nextDate = addDays(nextDate, 1);
                break;
              case 'weekly':
                // If we're before the original day of week, move to next week
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

            // Set the correct time of day
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
          processedEvents.push(recurringEvent);
        }
      });

      // Sort by start time and return next 3 events
      return processedEvents
        .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime())
        .slice(0, 3);
    },
    refetchInterval: 60000, // Refetch every minute
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
      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white/90 font-medium">Nächste Termine</h3>
            <Button variant="ghost" onClick={handleCalendarClick}>
              Kalender
            </Button>
          </div>

          <div className="space-y-3">
            {nextEvents.map((event) => {
              const startTime = parseISO(event.start_time);
              const endTime = event.end_time ? parseISO(event.end_time) : addHours(startTime, 1);
              const isLive = isEventLive(event);

              return (
                <div 
                  key={event.id} 
                  className="flex items-center justify-between p-3 rounded-md bg-black/10 hover:bg-black/20 transition-colors cursor-pointer"
                  onClick={() => handleEventClick(event)}
                  style={{
                    borderLeft: `4px solid ${event.color || '#FEF7CD'}`
                  }}
                >
                  <div className="space-y-1">
                    <div className="text-lg text-white/90">
                      {event.title}
                      {event.recurring_pattern !== 'none' && (
                        <span className="ml-2 text-xs text-gray-400">
                          (Wiederkehrend: {
                            event.recurring_pattern === 'daily' ? 'Täglich' :
                            event.recurring_pattern === 'weekly' ? 'Wöchentlich' :
                            'Monatlich'
                          })
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300/90">
                        {format(startTime, "d. MMMM yyyy, HH:mm", { locale: de })} - {format(endTime, "HH:mm", { locale: de })} Uhr
                      </span>
                      <span className="text-sm text-gray-400/90">
                        ({formatTimeDistance(startTime)})
                      </span>
                      {isLive && (
                        <span className="flex items-center gap-1 text-sm text-red-400">
                          <span className="animate-pulse w-2 h-2 rounded-full bg-red-500" />
                          LIVE
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Details
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Termin Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Zeit</h4>
                <p>
                  {format(parseISO(selectedEvent.start_time), "d. MMMM yyyy, HH:mm", { locale: de })} - 
                  {format(selectedEvent.end_time ? parseISO(selectedEvent.end_time) : addHours(parseISO(selectedEvent.start_time), 1), "HH:mm", { locale: de })} Uhr
                </p>
                <p className="text-sm text-gray-500">
                  {formatTimeDistance(parseISO(selectedEvent.start_time))}
                </p>
              </div>
              {selectedEvent.description && (
                <div className="space-y-2">
                  <h4 className="font-medium">Beschreibung</h4>
                  <p>{selectedEvent.description}</p>
                </div>
              )}
              {selectedEvent.meeting_link && (
                <div className="space-y-2">
                  <h4 className="font-medium">Meeting Link</h4>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <Button 
                      variant="link" 
                      onClick={() => window.open(selectedEvent.meeting_link)}
                      className="p-0"
                    >
                      Zum Meeting beitreten
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
