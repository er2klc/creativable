import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button variant="outline">Create Lead</Button>
          <Button variant="outline">Schedule Meeting</Button>
        </div>
      </CardContent>
    </Card>
  );
};