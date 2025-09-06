import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthenticatedSupportView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Dashboard</CardTitle>
        <CardDescription>Willkommen im Support-Bereich</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Support-Funktionen sind hier verfügbar.
        </p>
      </CardContent>
    </Card>
  );
}