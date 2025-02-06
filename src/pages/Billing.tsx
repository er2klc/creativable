import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Billing = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Rechnungen</h1>
      <Card>
        <CardHeader>
          <CardTitle>Rechnungsübersicht</CardTitle>
          <CardDescription>
            Ihre Rechnungen und Zahlungseinstellungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Diese Funktion wird in Kürze verfügbar sein.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;