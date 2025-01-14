import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyNameField } from "./mlm/CompanyNameField";
import { ProductsServicesField } from "./mlm/ProductsServicesField";
import { TargetAudienceField } from "./mlm/TargetAudienceField";
import { UspField } from "./mlm/UspField";
import { BusinessDescriptionField } from "./mlm/BusinessDescriptionField";
import { useSettings } from "@/hooks/use-settings";
import { Building2, Package, Users2, Star, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function MLMSettings() {
  const { settings, updateSettings } = useSettings();
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchCompanyInfo = async () => {
    if (!settings?.company_name) {
      toast.error("Bitte geben Sie zuerst einen Firmennamen ein");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-company-info', {
        body: { companyName: settings?.company_name }
      });

      if (error) throw error;

      if (data) {
        await updateSettings.mutateAsync({
          company_name: data.companyName,
          products_services: data.productsServices,
          target_audience: data.targetAudience,
          usp: data.usp,
          business_description: data.businessDescription,
        });

        toast.success("Business Informationen erfolgreich aktualisiert");
      }
    } catch (error: any) {
      console.error('Error fetching company info:', error);
      toast.error(error.message || "Fehler beim Abrufen der Business Informationen");
    } finally {
      setIsLoading(false);
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
          <Building2 className="absolute left-0 top-8 h-5 w-5 text-gray-500" />
          <div className="pl-8 flex items-start gap-4">
            <div className="flex-1">
              <CompanyNameField
                initialValue={settings?.company_name || ""}
                onSave={(value) => updateSettings.mutateAsync({ company_name: value })}
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
              onSave={(value) => updateSettings.mutateAsync({ products_services: value })}
            />
          </div>
        </div>

        <div className="relative">
          <Users2 className="absolute left-0 top-8 h-5 w-5 text-gray-500" />
          <div className="pl-8">
            <TargetAudienceField
              initialValue={settings?.target_audience || ""}
              onSave={(value) => updateSettings.mutateAsync({ target_audience: value })}
            />
          </div>
        </div>

        <div className="relative">
          <Star className="absolute left-0 top-8 h-5 w-5 text-gray-500" />
          <div className="pl-8">
            <UspField
              initialValue={settings?.usp || ""}
              onSave={(value) => updateSettings.mutateAsync({ usp: value })}
            />
          </div>
        </div>

        <div className="relative">
          <FileText className="absolute left-0 top-8 h-5 w-5 text-gray-500" />
          <div className="pl-8">
            <BusinessDescriptionField
              initialValue={settings?.business_description || ""}
              onSave={(value) => updateSettings.mutateAsync({ business_description: value })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}