
import { formatDateTime } from "../../utils/dateUtils";
import { Session } from "./types";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SessionProgressProps {
  viewId?: string;
  language?: string;
}

type SessionData = {
  start_time: string;
  max_progress: number;
};

export const SessionProgress = ({ viewId, language }: SessionProgressProps) => {
  const [viewSessions, setViewSessions] = useState<SessionData[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!viewId) return;

      const { data, error } = await supabase
        .from('presentation_views')
        .select('start_time,max_progress')
        .eq('view_id', viewId)
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }

      setViewSessions((data || []).map(() => ({
        start_time: new Date().toISOString(),
        max_progress: 0
      })) as SessionData[]);
    };

    fetchSessions();
  }, [viewId]);

  if (!viewSessions || viewSessions.length === 0) {
    return null;
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Berlin'
    };
    
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'de-DE', options).format(date);
  };

  return (
    <div className="space-y-4 mt-4">
      {viewSessions.map((session, index) => (
        <div key={index} className="space-y-2 bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 font-medium">
              {formatDate(session.start_time)}
            </span>
            <span className="text-xs font-medium text-green-600">
              {Math.round(session.max_progress)}%
            </span>
          </div>
          <Progress 
            value={session.max_progress} 
            className="h-2.5 bg-gray-200" 
          />
        </div>
      ))}
    </div>
  );
};
