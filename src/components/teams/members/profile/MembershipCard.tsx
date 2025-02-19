
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface MembershipCardProps {
  teamData: {
    logo_url?: string;
    name: string;
  };
  followersCount: number;
}

export const MembershipCard = ({ teamData, followersCount }: MembershipCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold">Memberships</h3>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Avatar className="h-12 w-12">
            <AvatarImage src={teamData.logo_url} alt={teamData.name} />
            <AvatarFallback>{teamData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium">{teamData.name}</h4>
            <p className="text-sm text-muted-foreground">Private • {followersCount} Members</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
