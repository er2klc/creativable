import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const DashboardCards = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Aktuelle Aufgaben</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Keine Aufgaben vorhanden
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>KI-Empfehlungen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Keine Empfehlungen verfügbar
          </p>
        </CardContent>
      </Card>
    </div>
  );
};