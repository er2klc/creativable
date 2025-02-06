import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Billing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rechnung</h1>
        <p className="text-muted-foreground">
          Verwalten Sie hier Ihre Rechnungen und Zahlungsmethoden.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rechnungsübersicht</CardTitle>
          <CardDescription>
            Hier finden Sie eine Übersicht Ihrer Rechnungen und Zahlungen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Billing content will go here */}
        </CardContent>
      </Card>
    </div>
  );
}