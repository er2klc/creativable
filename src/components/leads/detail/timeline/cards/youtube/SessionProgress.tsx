
import { formatDateTime } from "../../utils/dateUtils";
import { Session } from "./types";

interface SessionProgressProps {
  sessions: Session[];
  language?: string;
}

export const SessionProgress = ({ sessions, language }: SessionProgressProps) => {
  console.log("DEBUG SessionProgress:", { 
    sessions, 
    language,
    sessionCount: sessions?.length || 0,
    timestamp: new Date().toISOString()
  });
  
  if (!sessions || sessions.length === 0) {
    console.log("No sessions available to display");
    return null;
  }

  return (
    <div className="space-y-4 mt-4">
      {sessions.map((session, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>{formatDateTime(session.timestamp, language)}</span>
            <span className="text-xs text-gray-600">{Math.round(session.progress)}%</span>
          </div>
          <div className="relative h-2 bg-gray-200 rounded">
            <div 
              className="absolute left-0 top-0 h-full bg-blue-500 rounded transition-all duration-300"
              style={{ width: `${session.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

