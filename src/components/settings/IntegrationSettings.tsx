import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OpenAIIntegration } from "./integrations/OpenAIIntegration";
import { InstagramIntegration } from "./integrations/InstagramIntegration";
import { LinkedInIntegration } from "./integrations/LinkedInIntegration";
import { TikTokIntegration } from "./integrations/TikTokIntegration";
import { WhatsAppIntegration } from "./integrations/WhatsAppIntegration";

export function IntegrationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Drittanbieter-Integrationen</CardTitle>
        <CardDescription>
          Verwalten Sie hier Ihre API-Keys und Social Media Verbindungen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">KI & API Integrationen</h2>
          <OpenAIIntegration />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Social Media Integrationen</h2>
          <div className="space-y-4">
            <InstagramIntegration />
            <LinkedInIntegration />
            <TikTokIntegration />
            <WhatsAppIntegration />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}