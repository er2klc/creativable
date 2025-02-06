import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Plan() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Plan</h1>
        <p className="text-muted-foreground">
          Verwalten Sie hier Ihren Plan und Abonnements.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
          <CardDescription>
            Hier finden Sie Details zu Ihrem aktuellen Plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Plan content will go here */}
        </CardContent>
      </Card>
    </div>
  );
}