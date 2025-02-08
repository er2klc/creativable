
import { useState, useEffect } from 'react';
import { Session } from '../types';

interface ViewHistoryEntry {
  timestamp: string;
  progress: number;
}

export const useSessionMilestones = (viewHistory?: ViewHistoryEntry[]) => {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (!viewHistory || !Array.isArray(viewHistory)) {
      console.log("No view history available");
      setSessions([]);
      return;
    }

    const calculateSessions = () => {
      const tempSessions: Session[] = [];
      let currentSession = {
        timestamp: '',
        progress: 0,
        lastTimestamp: new Date().getTime()
      };

      console.log("Processing view history:", viewHistory);

      const history = [...viewHistory].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      history.forEach(entry => {
        const timestamp = new Date(entry.timestamp).getTime();
        
        if (timestamp - currentSession.lastTimestamp > 30 * 60 * 1000) {
          if (currentSession.timestamp) {
            tempSessions.push({
              timestamp: currentSession.timestamp,
              progress: currentSession.progress
            });
          }
          currentSession = {
            timestamp: entry.timestamp,
            progress: entry.progress,
            lastTimestamp: timestamp
          };
        } else {
          currentSession.progress = Math.max(currentSession.progress, entry.progress);
          currentSession.lastTimestamp = timestamp;
        }
      });

      if (currentSession.timestamp) {
        tempSessions.push({
          timestamp: currentSession.timestamp,
          progress: currentSession.progress
        });
      }

      console.log("Generated sessions:", tempSessions);
      setSessions(tempSessions);
    };

    calculateSessions();
  }, [viewHistory]);

  return sessions;
};

