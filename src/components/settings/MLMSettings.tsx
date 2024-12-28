import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyNameField } from "./mlm/CompanyNameField";
import { ProductsServicesField } from "./mlm/ProductsServicesField";
import { TargetAudienceField } from "./mlm/TargetAudienceField";
import { UspField } from "./mlm/UspField";
import { BusinessDescriptionField } from "./mlm/BusinessDescriptionField";
import { useSettings } from "@/hooks/use-settings";
import { Building2, Package, Users2, Star, FileText } from "lucide-react";

export function MLMSettings() {
  const { settings, updateSettings } = useSettings();

  const handleSave = async (field: string, value: string) => {
    await updateSettings.mutateAsync({ [field]: value });
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>MLM-Firmeninformationen</CardTitle>
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