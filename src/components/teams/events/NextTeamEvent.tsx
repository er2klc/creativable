
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, isWithinInterval, formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface NextTeamEventProps {
  teamId: string;
  teamSlug: string;
}

export function NextTeamEvent({ teamId, teamSlug }: NextTeamEventProps) {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
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
      const now = new Date();
      const { data, error } = await supabase
        .from("team_calendar_events")
        .select("*")
        .eq("team_id", teamId)
        .gte("start_time", now.toISOString())
        .order("start_time")
        .limit(3);

      if (error) {
        console.error("Error fetching next events:", error);
        return [];
      }

      return data;
    },
    refetchInterval: 60000, // Refetch every minute to keep live status updated
  });

  const isEventLive = (event: any) => {
    if (!event) return false;
    const startTime = new Date(event.start_time);
    const endTime = event.end_time ? new Date(event.end_time) : new Date(startTime.getTime() + 60 * 60 * 1000);
    
    return isWithinInterval(now, { start: startTime, end: endTime });
  };

  const formatTimeDistance = (date: Date) => {
    return formatDistanceToNow(date, { locale: de, addSuffix: true });
  };

  const handleEventClick = (event: any) => {
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
              const startTime = new Date(event.start_time);
              const endTime = event.end_time ? new Date(event.end_time) : new Date(startTime.getTime() + 60 * 60 * 1000);
              const isLive = isEventLive(event);

              return (
                <div 
                  key={event.id} 
                  className="flex items-center justify-between p-3 rounded-md bg-black/10 hover:bg-black/20 transition-colors cursor-pointer"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="space-y-1">
                    <div className="text-lg text-white/90">{event.title}</div>
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
                  {format(new Date(selectedEvent.start_time), "d. MMMM yyyy, HH:mm", { locale: de })} - {format(new Date(selectedEvent.end_time || new Date(selectedEvent.start_time).getTime() + 60 * 60 * 1000), "HH:mm", { locale: de })} Uhr
                </p>
                <p className="text-sm text-gray-500">
                  {formatTimeDistance(new Date(selectedEvent.start_time))}
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
