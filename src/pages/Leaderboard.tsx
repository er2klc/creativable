import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Leaderboard = () => {
  const { teamId } = useParams();

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ["team-leaderboard", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_member_points")
        .select(`
          points,
          level,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq("team_id", teamId)
        .order("points", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading leaderboard...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Team Leaderboard</h1>
      <div className="space-y-4">
        {leaderboardData?.map((member, index) => (
          <div 
            key={member.profiles.display_name} 
            className="flex items-center justify-between p-4 bg-card rounded-lg shadow"
          >
            <div className="flex items-center gap-4">
              <span className="text-xl font-semibold">#{index + 1}</span>
              <img 
                src={member.profiles.avatar_url || "/placeholder.svg"} 
                alt={member.profiles.display_name}
                className="w-10 h-10 rounded-full"
              />
              <span className="font-medium">{member.profiles.display_name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-primary/10 rounded-full text-sm">
                Level {member.level}
              </span>
              <span className="font-semibold">{member.points} points</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;