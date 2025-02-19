
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, isWithinInterval } from "date-fns";
import { de } from "date-fns/locale";

interface NextTeamEventProps {
  teamId: string;
  teamSlug: string;
}

export function NextTeamEvent({ teamId, teamSlug }: NextTeamEventProps) {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const { data: nextEvent } = useQuery({
    queryKey: ["next-team-event", teamId],
    queryFn: async () => {
      const now = new Date();
      const { data, error } = await supabase
        .from("team_calendar_events")
        .select("*")
        .eq("team_id", teamId)
        .gte("start_time", now.toISOString())
        .order("start_time")
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching next event:", error);
        return null;
      }

      return data;
    },
    refetchInterval: 60000, // Refetch every minute to keep live status updated
  });

  const isEventLive = (event: any) => {
    if (!event) return false;
    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = event.end_time ? new Date(event.end_time) : new Date(startTime.getTime() + 60 * 60 * 1000);
    
    return isWithinInterval(now, { start: startTime, end: endTime });
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowDetails(true);
  };

  const handleCalendarClick = () => {
    navigate(`/unity/team/${teamSlug}/calendar`);
  };

  if (!nextEvent) return null;

  const startTime = new Date(nextEvent.start_time);
  const endTime = nextEvent.end_time ? new Date(nextEvent.end_time) : new Date(startTime.getTime() + 60 * 60 * 1000);
  const isLive = isEventLive(nextEvent);

  return (
    <>
      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-white/90 font-medium">Nächster Termin</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300/90">
                {format(startTime, "d. MMMM yyyy, HH:mm", { locale: de })} - {format(endTime, "HH:mm", { locale: de })} Uhr
              </span>
              {isLive && (
                <span className="flex items-center gap-1 text-sm text-red-400">
                  <span className="animate-pulse w-2 h-2 rounded-full bg-red-500" />
                  LIVE
                </span>
              )}
            </div>
            <div className="text-lg text-white/90">{nextEvent.title}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => handleEventClick(nextEvent)}>
              Details
            </Button>
            <Button variant="ghost" onClick={handleCalendarClick}>
              Kalender
            </Button>
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
