import React, { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy load only stable components
const SmtpSettingsSimplified = lazy(() => import("@/components/settings/SmtpSettingsSimplified"));
const IntegrationsSimplified = lazy(() => import("@/components/settings/integrations/IntegrationsSimplified"));

export default function Settings() {
  return (
    <div className="container mx-auto py-6">
      <SettingsHeader />
      
      <Tabs defaultValue="smtp" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="smtp">SMTP</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="mlm">MLM</TabsTrigger>
        </TabsList>
        
        <TabsContent value="smtp">
          <Suspense fallback={<LoadingSpinner />}>
            <SmtpSettingsSimplified />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="integrations">
          <Suspense fallback={<LoadingSpinner />}>
            <IntegrationsSimplified />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                General settings will be available here soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mlm">
          <Card>
            <CardHeader>
              <CardTitle>MLM Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                MLM settings will be available here soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}