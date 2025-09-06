import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityCalendarProps {
  activities: any[];
}

export const ActivityCalendar = ({ activities }: ActivityCalendarProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitäten</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          {activities.length > 0 ? (
            <p>{activities.length} Aktivitäten gefunden</p>
          ) : (
            <p>Keine Aktivitäten vorhanden</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};