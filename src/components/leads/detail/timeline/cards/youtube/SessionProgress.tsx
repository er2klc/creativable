
import { formatDateTime } from "../../utils/dateUtils";
import { Session } from "./types";
import { Progress } from "@/components/ui/progress";

interface SessionProgressProps {
  sessions: Session[];
  language?: string;
}

export const SessionProgress = ({ sessions, language }: SessionProgressProps) => {
  if (!sessions || sessions.length === 0) {
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
    
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'de-DE', options).format(date) + 
           ' (+2 Std.)';
  };

  return (
    <div className="space-y-4 mt-4">
      {sessions.map((session, index) => (
        <div key={index} className="space-y-2 bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 font-medium">
              {formatDate(session.timestamp)}
            </span>
            <span className="text-xs font-medium text-green-600">
              {Math.round(session.progress)}%
            </span>
          </div>
          <Progress 
            value={session.progress} 
            className="h-2.5 bg-gray-200" 
            indicatorClassName="bg-green-500 transition-all duration-300"
          />
        </div>
      ))}
    </div>
  );
};
