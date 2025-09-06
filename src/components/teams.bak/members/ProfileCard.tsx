import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileCardProps {
  memberData: any;
  memberSlug: string;
  currentLevel: number;
  currentPoints: number;
  pointsToNextLevel: number;
  aboutMe: string;
}

export const ProfileCard = ({ memberData, currentLevel, currentPoints, pointsToNextLevel }: ProfileCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{memberData.display_name || 'Mitglied'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <strong>Level:</strong> {currentLevel}
          </div>
          <div>
            <strong>Punkte:</strong> {currentPoints}
          </div>
          <div>
            <strong>Bis nächstes Level:</strong> {pointsToNextLevel}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};