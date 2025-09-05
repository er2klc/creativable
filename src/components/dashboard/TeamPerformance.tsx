import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, TrendingUp } from "lucide-react";

export function TeamPerformance() {
  const teamMembers = [
    {
      name: "Anna Schmidt",
      avatar: "",
      leads: 23,
      conversions: 5,
      rank: 1,
      trend: "up"
    },
    {
      name: "Max Müller", 
      avatar: "",
      leads: 18,
      conversions: 4,
      rank: 2,
      trend: "up"
    },
    {
      name: "Sarah Weber",
      avatar: "",
      leads: 15,
      conversions: 3,
      rank: 3,
      trend: "stable"
    },
    {
      name: "Tom Fischer",
      avatar: "",
      leads: 12,
      conversions: 2,
      rank: 4,
      trend: "down"
    }
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Star className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Star className="h-4 w-4 text-amber-600" />;
    return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
  };

  const getTrendColor = (trend: string) => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600"; 
    return "text-gray-600";
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-2">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          Team Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {teamMembers.map((member, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {getRankIcon(member.rank)}
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-600">{member.leads} Leads</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-white">
                {member.conversions} Conversions
              </Badge>
              <TrendingUp className={`h-4 w-4 ${getTrendColor(member.trend)}`} />
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Team Gesamt:</span>
            <span className="font-semibold">68 Leads • 14 Conversions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}