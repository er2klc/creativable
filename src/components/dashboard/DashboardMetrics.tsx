import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";

export const DashboardMetrics = () => {
  const { settings } = useSettings();

  return (
    <div className="space-y-6 w-full mb-8">
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium truncate">
              {settings?.language === "en" ? "Active Leads" : "Leads in Bearbeitung"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium truncate">
              {settings?.language === "en" ? "Open Tasks" : "Offene Aufgaben"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium truncate">
              {settings?.language === "en" ? "Completion Rate" : "Abschlussquote"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};