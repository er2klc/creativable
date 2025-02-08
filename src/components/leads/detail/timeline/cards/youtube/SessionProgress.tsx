
import { formatDateTime } from "../../utils/dateUtils";
import { Session } from "./types";

interface SessionProgressProps {
  sessions: Session[];
  language?: string;
}

export const SessionProgress = ({ sessions, language }: SessionProgressProps) => {
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
              className="absolute left-0 top-0 h-full bg-green-500 rounded"
              style={{ width: `${session.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
