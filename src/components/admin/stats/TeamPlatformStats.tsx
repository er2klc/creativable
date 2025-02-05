import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, GraduationCap } from "lucide-react";

interface TeamPlatformStatsProps {
  totalTeams: number;
  totalPlatforms: number;
}

export const TeamPlatformStats = ({ totalTeams, totalPlatforms }: TeamPlatformStatsProps) => {
  return (
    <>
      <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-none shadow-lg backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-black flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Teams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-black">{totalTeams}</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-rose-500/20 to-pink-500/20 border-none shadow-lg backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-black flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Ausbildungsplattformen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-black">{totalPlatforms}</p>
        </CardContent>
      </Card>
    </>
  );
};