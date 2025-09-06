import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MembershipCardProps {
  userId: string;
}

export const MembershipCard = ({ userId }: MembershipCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mitgliedschaft</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Benutzer ID: {userId}</p>
      </CardContent>
    </Card>
  );
};