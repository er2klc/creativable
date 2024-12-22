import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { MLMSettings } from "@/components/settings/MLMSettings";
import { IntegrationSettings } from "@/components/settings/IntegrationSettings";
import { AboutSettings } from "@/components/settings/AboutSettings";
import { useSettings } from "@/hooks/use-settings";

export default function Settings() {
  const { settings, isLoading } = useSettings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground">
          Verwalten Sie hier Ihre globalen Einstellungen und Integrationen.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="mlm">MLM-Informationen</TabsTrigger>
          <TabsTrigger value="about">Über mich</TabsTrigger>
          <TabsTrigger value="integrations">Integrationen</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="mlm" className="space-y-4">
          <MLMSettings />
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <AboutSettings />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <IntegrationSettings settings={settings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}