
import { formatDateTime } from "../../utils/dateUtils";
import { Session } from "./types";

interface SessionProgressProps {
  sessions: Session[];
  language?: string;
}

export const SessionProgress = ({ sessions, language }: SessionProgressProps) => {
  if (!sessions || sessions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mt-4">
      {sessions.map((session, index) => (
        <div key={index} className="space-y-2 bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              {formatDateTime(session.timestamp, language)}
            </span>
            <span className="text-xs font-medium text-gray-600">
              {Math.round(session.progress)}%
            </span>
          </div>
          <div className="relative h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${session.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
