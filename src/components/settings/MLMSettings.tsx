import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyNameField } from "./mlm/CompanyNameField";
import { ProductsServicesField } from "./mlm/ProductsServicesField";
import { TargetAudienceField } from "./mlm/TargetAudienceField";
import { UspField } from "./mlm/UspField";
import { BusinessDescriptionField } from "./mlm/BusinessDescriptionField";
import { useSettings } from "@/hooks/use-settings";
import { Building2, Package, Users2, Star, FileText, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function MLMSettings() {
  const { settings, updateSettings } = useSettings();

  const handleSave = async (field: string, value: string) => {
    await updateSettings.mutateAsync({ [field]: value });
  };

  const analyzeWithAI = async () => {
    if (!settings?.company_name) {
      toast.error("Bitte geben Sie zuerst einen Firmennamen ein.");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('fetch-company-info', {
        body: { companyName: settings.company_name }
      });

      if (error) throw error;

      if (data) {
        await updateSettings.mutateAsync({
          products_services: data.productsServices,
          target_audience: data.targetAudience,
          usp: data.usp,
          business_description: data.businessDescription,
        });

        toast.success("Firmendaten erfolgreich analysiert und aktualisiert");
      }
    } catch (error) {
      console.error('Error analyzing company:', error);
      toast.error("Fehler bei der KI-Analyse. Bitte versuchen Sie es später erneut.");
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-center">
          <CardTitle>MLM-Firmeninformationen</CardTitle>
          <Button
            onClick={analyzeWithAI}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Bot className="h-4 w-4" />
            Mit KI analysieren
          </Button>
        </div>
        <CardDescription>
          Hinterlegen Sie hier Ihre Firmeninformationen für die automatische Verwendung in Nachrichten.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <Building2 className="absolute left-0 top-8 h-5 w-5 text-gray-500" />
          <div className="pl-8">
            <CompanyNameField
              initialValue={settings?.company_name || ""}
              onSave={(value) => handleSave("company_name", value)}
            />
          </div>
        </div>

        <div className="relative">
          <Package className="absolute left-0 top-8 h-5 w-5 text-gray-500" />
          <div className="pl-8">
            <ProductsServicesField
              initialValue={settings?.products_services || ""}
              onSave={(value) => handleSave("products_services", value)}
            />
          </div>
        </div>

        <div className="relative">
          <Users2 className="absolute left-0 top-8 h-5 w-5 text-gray-500" />
          <div className="pl-8">
            <TargetAudienceField
              initialValue={settings?.target_audience || ""}
              onSave={(value) => handleSave("target_audience", value)}
            />
          </div>
        </div>

        <div className="relative">
          <Star className="absolute left-0 top-8 h-5 w-5 text-gray-500" />
          <div className="pl-8">
            <UspField
              initialValue={settings?.usp || ""}
              onSave={(value) => handleSave("usp", value)}
            />
          </div>
        </div>

        <div className="relative">
          <FileText className="absolute left-0 top-8 h-5 w-5 text-gray-500" />
          <div className="pl-8">
            <BusinessDescriptionField
              initialValue={settings?.business_description || ""}
              onSave={(value) => handleSave("business_description", value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}