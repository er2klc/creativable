import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Trophy, ArrowUp, ArrowDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const LeaderBoard = () => {
  const { teamId } = useParams();
  const [showAllMembers, setShowAllMembers] = useState(false);

  const { data: teamPoints } = useQuery({
    queryKey: ["team-points", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_member_points")
        .select(`
          *,
          profiles:user_id (
            id,
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

  const displayMembers = showAllMembers ? teamPoints : teamPoints?.slice(0, 5);

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Trophy className="h-8 w-8 text-red-500" />
        <h1 className="text-3xl font-bold">Team Leaderboard</h1>
      </div>

      <div className="grid gap-4">
        {displayMembers?.map((member, index) => (
          <Card key={member.id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                {index < 3 ? (
                  <Trophy className={`h-8 w-8 ${
                    index === 0 ? "text-yellow-500" :
                    index === 1 ? "text-gray-400" :
                    "text-amber-700"
                  }`} />
                ) : (
                  <span className="text-xl font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                )}
              </div>

              <Avatar className="h-12 w-12">
                <AvatarImage src={member.profiles?.avatar_url || ""} />
                <AvatarFallback>
                  {member.profiles?.display_name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-grow">
                <div className="font-semibold">
                  {member.profiles?.display_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  Level {member.level}
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold">{member.points}</div>
                <div className="text-sm text-muted-foreground">Punkte</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {teamPoints && teamPoints.length > 5 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setShowAllMembers(!showAllMembers)}
          >
            {showAllMembers ? (
              <>
                <ArrowUp className="h-4 w-4 mr-2" />
                Weniger anzeigen
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4 mr-2" />
                Alle anzeigen
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LeaderBoard;