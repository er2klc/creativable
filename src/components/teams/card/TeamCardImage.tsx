import { type Tables } from "@/integrations/supabase/types";
import { Play } from "lucide-react";

interface TeamCardImageProps {
  team: Tables<"teams">;
}

export const TeamCardImage = ({ team }: TeamCardImageProps) => {
  return (
    <div className="relative w-full h-[400px] overflow-hidden">
      {team.logo_url ? (
        <>
          <img 
            src={team.logo_url} 
            alt={team.name} 
            className="w-full h-full object-cover"
          />
          {team.video_url && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity group-hover:opacity-100">
              <Play className="w-16 h-16 text-white" />
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <span className="text-5xl font-semibold">
            {team.name.substring(0, 2).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};