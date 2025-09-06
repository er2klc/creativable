import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityFeedProps {
  activities: any[];
  teamSlug: string;
}

export const ActivityFeed = ({ activities, teamSlug }: ActivityFeedProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitäts-Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <div key={index} className="p-2 border-b">
                {activity.description || 'Aktivität'}
              </div>
            ))
          ) : (
            <p>Keine Aktivitäten im Feed</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};