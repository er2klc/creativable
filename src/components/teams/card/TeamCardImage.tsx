import { Play } from "lucide-react";
import { type Tables } from "@/integrations/supabase/types";
import { useState } from "react";

interface TeamCardImageProps {
  team: Tables<"teams">;
}

export const TeamCardImage = ({ team }: TeamCardImageProps) => {
  const [showVideo, setShowVideo] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (team.video_url && !showVideo) {
      e.stopPropagation();
      setShowVideo(true);
    }
  };

  // Extract video ID from YouTube URL
  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&\?]{10,12})/);
    return match?.[1];
  };

  return (
    <div className="relative w-full h-[400px] overflow-hidden cursor-pointer" onClick={handleClick}>
      {showVideo && team.video_url ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${getVideoId(team.video_url)}?autoplay=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          {team.logo_url ? (
            <img 
              src={team.logo_url} 
              alt={team.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-5xl font-semibold">
                {team.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          {team.video_url && !showVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Play className="w-16 h-16 text-white" />
            </div>
          )}
        </>
      )}
    </div>
  );
};