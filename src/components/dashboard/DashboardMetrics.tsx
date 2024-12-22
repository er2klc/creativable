import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const DashboardMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">
            Leads in Bearbeitung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">45</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">
            Offene Antworten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">10</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">
            Abschlussquote
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">25%</p>
        </CardContent>
      </Card>
    </div>
  );
};