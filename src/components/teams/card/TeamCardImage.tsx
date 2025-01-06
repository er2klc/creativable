import { type Tables } from "@/integrations/supabase/types";
import { Play } from "lucide-react";

interface TeamCardImageProps {
  team: Tables<"teams">;
}

export const TeamCardImage = ({ team }: TeamCardImageProps) => {
  return (
    <div className="relative w-full h-48 rounded-lg overflow-hidden">
      {team.logo_url ? (
        <>
          <img 
            src={team.logo_url} 
            alt={team.name} 
            className="w-full h-full object-cover"
          />
          {team.video_url && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Play className="w-12 h-12 text-white" />
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <span className="text-3xl font-semibold">
            {team.name.substring(0, 2).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};