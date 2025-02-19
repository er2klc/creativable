
import { Play } from "lucide-react";
import { type Tables } from "@/integrations/supabase/types";
import { useState } from "react";

interface TeamCardImageProps {
  team: Tables<"teams">;
}

export const TeamCardImage = ({ team }: TeamCardImageProps) => {
  const [showVideo, setShowVideo] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (team.video_url && !showVideo) {
      setShowVideo(true);
    }
  };

  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&\?]{10,12})/);
    return match?.[1];
  };

  return (
    <div className="relative w-full h-full">
      {showVideo && team.video_url ? (
        <div className="absolute inset-0 w-full h-full z-20">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${getVideoId(team.video_url)}?autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <>
          {team.logo_url ? (
            <img 
              src={team.logo_url} 
              alt={team.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#333]">
              <span className="text-3xl font-semibold text-white/50">
                {team.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          {team.video_url && !showVideo && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30 cursor-pointer z-10"
              onClick={handleClick}
            >
              <Play className="w-8 h-8 text-white/90" />
            </div>
          )}
        </>
      )}
    </div>
  );
};
