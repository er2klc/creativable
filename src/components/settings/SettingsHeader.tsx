import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const SettingsHeader = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Einstellungen</CardTitle>
        <CardDescription>
          Verwalten Sie Ihre Anwendungseinstellungen und Konfigurationen.
        </CardDescription>
      </CardHeader>
    </Card>
  );
};