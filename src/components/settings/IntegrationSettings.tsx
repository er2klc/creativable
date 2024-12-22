import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OpenAIIntegration } from "./integrations/OpenAIIntegration";
import { InstagramIntegration } from "./integrations/InstagramIntegration";

export function IntegrationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Drittanbieter-Integrationen</CardTitle>
        <CardDescription>
          Verwalten Sie hier Ihre API-Keys für verschiedene Integrationen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <OpenAIIntegration />
        <InstagramIntegration />
      </CardContent>
    </Card>
  );
}