import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function VisitorSupportForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Support</CardTitle>
        <CardDescription>Kontaktieren Sie unser Support-Team</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Melden Sie sich an, um auf alle Support-Funktionen zuzugreifen.
        </p>
        <Button>Anmelden</Button>
      </CardContent>
    </Card>
  );
}