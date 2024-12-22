import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { MLMSettings } from "@/components/settings/MLMSettings";
import { IntegrationSettings } from "@/components/settings/IntegrationSettings";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const session = useSession();

  const { data: settings } = useQuery({
    queryKey: ["settings", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", session?.user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

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
          <TabsTrigger value="integrations">Integrationen</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <GeneralSettings settings={settings} />
        </TabsContent>

        <TabsContent value="mlm" className="space-y-4">
          <MLMSettings settings={settings} />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <IntegrationSettings settings={settings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}