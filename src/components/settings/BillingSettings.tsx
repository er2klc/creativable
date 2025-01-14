import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function BillingSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan & Rechnung</CardTitle>
        <CardDescription>
          Verwalten Sie hier Ihre Abonnements und Rechnungen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Billing content will go here */}
      </CardContent>
    </Card>
  );
}