
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { MLMSettings } from "@/components/settings/MLMSettings";
import { IntegrationSettings } from "@/components/settings/IntegrationSettings";
import { AboutSettings } from "@/components/settings/AboutSettings";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { NewEmailSettings } from "@/components/settings/NewEmailSettings";
import { useSettings } from "@/hooks/use-settings";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { useUser } from "@supabase/auth-helpers-react";
import { Settings as SettingsIcon } from "lucide-react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function Settings() {
  const { settings, isLoading } = useSettings();
  const user = useUser();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  // Komponente für initiale Tabs-Auswahl basierend auf URL-Parameter
  const defaultTab = tabParam || "general";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
        <div className="w-full">
          <div className="h-16 px-4 flex items-center">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                <h1 className="text-lg md:text-xl font-semibold text-foreground">
                  Einstellungen
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-[300px]">
                  <SearchBar />
                </div>
              </div>
              <HeaderActions profile={null} userEmail={user?.email} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-24">
        <p className="text-muted-foreground">
          Verwalten Sie hier Ihre globalen Einstellungen und Integrationen.
        </p>

        <Tabs defaultValue={defaultTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="email">E-Mail</TabsTrigger>
            <TabsTrigger value="mlm">Über mein Business</TabsTrigger>
            <TabsTrigger value="about">Über mich</TabsTrigger>
            <TabsTrigger value="billing">Plan & Rechnung</TabsTrigger>
            <TabsTrigger value="integrations">Integrationen</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <GeneralSettings />
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <NewEmailSettings />
          </TabsContent>

          <TabsContent value="mlm" className="space-y-4">
            <MLMSettings />
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <AboutSettings />
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <BillingSettings />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <IntegrationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
