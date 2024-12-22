import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyNameField } from "./mlm/CompanyNameField";
import { ProductsServicesField } from "./mlm/ProductsServicesField";
import { TargetAudienceField } from "./mlm/TargetAudienceField";
import { UspField } from "./mlm/UspField";
import { BusinessDescriptionField } from "./mlm/BusinessDescriptionField";
import { useSettings } from "@/hooks/use-settings";

export function MLMSettings() {
  const { settings, updateSettings } = useSettings();

  const handleSave = async (field: string, value: string) => {
    await updateSettings(field, value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>MLM-Firmeninformationen</CardTitle>
        <CardDescription>
          Hinterlegen Sie hier Ihre Firmeninformationen für die automatische Verwendung in Nachrichten.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <CompanyNameField
          initialValue={settings?.company_name || ""}
          onSave={(value) => handleSave("company_name", value)}
        />
        <ProductsServicesField
          initialValue={settings?.products_services || ""}
          onSave={(value) => handleSave("products_services", value)}
        />
        <TargetAudienceField
          initialValue={settings?.target_audience || ""}
          onSave={(value) => handleSave("target_audience", value)}
        />
        <UspField
          initialValue={settings?.usp || ""}
          onSave={(value) => handleSave("usp", value)}
        />
        <BusinessDescriptionField
          initialValue={settings?.business_description || ""}
          onSave={(value) => handleSave("business_description", value)}
        />
      </CardContent>
    </Card>
  );
}