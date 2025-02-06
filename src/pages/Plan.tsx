import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Plan = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Mein Plan</h1>
      <Card>
        <CardHeader>
          <CardTitle>Aktueller Plan</CardTitle>
          <CardDescription>
            Übersicht über Ihren aktuellen Plan und verfügbare Optionen
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

export default Plan;