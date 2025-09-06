import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface UserStatsProps {
  totalUsers: number;
  onlineUsers: number;
}

export const UserStats = ({ totalUsers, onlineUsers }: UserStatsProps) => {
  return (
    <>
      <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-none shadow-lg backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-black flex items-center gap-2">
            <Users className="h-5 w-5" />
            Registrierte Benutzer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-black">{totalUsers}</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-none shadow-lg backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-black flex items-center gap-2">
            <Users className="h-5 w-5" />
            Online Benutzer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-black">{onlineUsers}</p>
          <p className="text-sm text-black">Aktive Sitzungen der letzten 30 Minuten</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-none shadow-lg backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-black">Letzte Aktivität</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-black">Aktive Sitzungen in Echtzeit</p>
        </CardContent>
      </Card>
    </>
  );
};