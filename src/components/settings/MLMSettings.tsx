
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyNameField } from "./mlm/CompanyNameField";
import { ProductsServicesField } from "./mlm/ProductsServicesField";
import { TargetAudienceField } from "./mlm/TargetAudienceField";
import { UspField } from "./mlm/UspField";
import { BusinessDescriptionField } from "./mlm/BusinessDescriptionField";
import { useSettings } from "@/hooks/use-settings";
import { Building2, Package, Users2, Star, FileText, Sparkles, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Settings } from "@/integrations/supabase/types/settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MLMSettings() {
  const { settings, updateSettings } = useSettings();
  const [isLoading, setIsLoading] = React.useState(false);
  const [networkMarketingId, setNetworkMarketingId] = React.useState(settings?.network_marketing_id || "");

  React.useEffect(() => {
    if (settings?.network_marketing_id) {
      setNetworkMarketingId(settings.network_marketing_id);
    }
  }, [settings?.network_marketing_id]);

  const fetchCompanyInfo = async () => {
    if (!settings?.company_name) {
      toast.error("Bitte geben Sie zuerst einen Firmennamen ein");
      return;
    }

    setIsLoading(true);
    try {
      // Verbesserte Fehlerbehandlung und Logging
      console.log("Sending request to fetch-company-info function with company name:", settings?.company_name);
      
      const { data, error } = await supabase.functions.invoke('fetch-company-info', {
        body: { companyName: settings?.company_name }
      });

      if (error) {
        console.error("Error calling fetch-company-info function:", error);
        throw error;
      }
      
      if (!data) {
        console.error("No data returned from fetch-company-info function");
        throw new Error("Keine Informationen zum Unternehmen gefunden");
      }

      console.log("Received company info:", data);

      // Aktualisieren der Einstellungen mit den erhaltenen Daten
      await updateSettings.mutateAsync({
        company_name: data.companyName || settings?.company_name,
        products_services: data.productsServices || settings?.products_services,
        target_audience: data.targetAudience || settings?.target_audience,
        usp: data.usp || settings?.usp,
        business_description: data.businessDescription || settings?.business_description,
      });

      toast.success("Business Informationen erfolgreich aktualisiert");
    } catch (error: any) {
      console.error('Error fetching company info:', error);
      toast.error(error.message || "Fehler beim Abrufen der Business Informationen");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (value: string, field: keyof Settings) => {
    try {
      await updateSettings.mutateAsync({ [String(field)]: value });
      toast.success(`${String(field)} wurde erfolgreich gespeichert`);
    } catch (error) {
      console.error(`Error updating ${String(field)}:`, error);
      toast.error(`Fehler beim Speichern von ${String(field)}`);
    }
  };

  const handleNetworkMarketingIdSave = async () => {
    try {
      await updateSettings.mutateAsync({ network_marketing_id: networkMarketingId });
      toast.success("Network Marketing ID wurde erfolgreich gespeichert");
    } catch (error) {
      console.error('Error updating network marketing ID:', error);
      toast.error("Fehler beim Speichern der Network Marketing ID");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle>Meine Business Informationen</CardTitle>
          <CardDescription>
            Hinterlegen Sie hier Ihre Business Informationen für die automatische Verwendung in Nachrichten.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <Hash className="absolute left-0 top-8 h-5 w-5 text-gray-500" />
          <div className="pl-8">
            <div className="space-y-2">
              <Label>Network Marketing ID</Label>
              <div className="flex gap-2">
                <Input
                  value={networkMarketingId}
                  onChange={(e) => setNetworkMarketingId(e.target.value)}
                  placeholder="Ihre Network Marketing ID"
                />
                <Button onClick={handleNetworkMarketingIdSave}>
                  Speichern
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <Building2 className="absolute left-0 top-8 h-5 w-5 text-gray-500" />
          <div className="pl-8 flex items-start gap-4">
            <div className="flex-1">
              <CompanyNameField
                initialValue={settings?.company_name || ""}
                onSave={(value) => handleSave(value, 'company_name')}
              />
            </div>
            <Button 
              variant="secondary"
              onClick={fetchCompanyInfo}
              disabled={isLoading}
              className="mt-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Laden...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Autofill mit KI
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="relative">
          <Package className="absolute left-0 top-8 h-5 w-5 text-gray-500" />
          <div className="pl-8">
            <ProductsServicesField
              initialValue={settings?.products_services || ""}
              onSave={(value) => handleSave(value, 'products_services')}
            />
          </div>
        </div>

        <div className="relative">
          <Users2 className="absolute left-0 top-8 h-5 w-5 text-gray-500" />
          <div className="pl-8">
            <TargetAudienceField
              initialValue={settings?.target_audience || ""}
              onSave={(value) => handleSave(value, 'target_audience')}
            />
          </div>
        </div>

        <div className="relative">
          <Star className="absolute left-0 top-8 h-5 w-5 text-gray-500" />
          <div className="pl-8">
            <UspField
              initialValue={settings?.usp || ""}
              onSave={(value) => handleSave(value, 'usp')}
            />
          </div>
        </div>

        <div className="relative">
          <FileText className="absolute left-0 top-8 h-5 w-5 text-gray-500" />
          <div className="pl-8">
            <BusinessDescriptionField
              initialValue={settings?.business_description || ""}
              onSave={(value) => handleSave(value, 'business_description')}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
