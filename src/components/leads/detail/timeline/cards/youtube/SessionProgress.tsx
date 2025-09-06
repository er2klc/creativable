
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

type ProgressRow = { session_id: string; progress: number };

function useYtSessionProgress(sessionId: string | null) {
  return useQuery<ProgressRow | null, Error>({
    queryKey: ["yt-progress", sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("presentation_view_sessions" as any)
        .select("id,progress")
        .eq("id", sessionId!)
        .maybeSingle();
      if (error) throw error;
      return ((data as any) ?? null);
    },
  });
}

export const SessionProgress = ({ viewId, language }: { viewId?: string; language?: string }) => {
  const { data: sessionProgress } = useYtSessionProgress(viewId);

  if (!sessionProgress) {
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
      <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 font-medium">
            Progress
          </span>
          <span className="text-xs font-medium text-green-600">
            {Math.round(sessionProgress.progress)}%
          </span>
        </div>
        <Progress 
          value={sessionProgress.progress} 
          className="h-2.5 bg-gray-200" 
        />
      </div>
    </div>
  );
};
