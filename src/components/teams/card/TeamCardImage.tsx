import { type Tables } from "@/integrations/supabase/types";

interface TeamCardImageProps {
  team: Tables<"teams">;
}

export const TeamCardImage = ({ team }: TeamCardImageProps) => {
  return (
    <div className="relative min-w-[120px] h-20 rounded-lg overflow-hidden">
      {team.logo_url ? (
        <>
          <img 
            src={team.logo_url} 
            alt={team.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/80" />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <span className="text-xl font-semibold">
            {team.name.substring(0, 2).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};