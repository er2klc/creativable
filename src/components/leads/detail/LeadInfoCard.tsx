import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { Contact2, Building2, Briefcase, Phone, Mail, Globe, MapPin, Calendar, MessageSquare, Clock, Languages, Heart, Target, AlertCircle, Share2, UserPlus } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useParams } from "react-router-dom";

interface LeadInfoCardProps {
  lead: Tables<"leads">;
}

export function LeadInfoCard({ lead }: LeadInfoCardProps) {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const { leadSlug } = useParams();

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: Partial<Tables<"leads">>) => {
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", lead.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadSlug] });
      toast.success(
        settings?.language === "en"
          ? "Contact updated successfully"
          : "Kontakt erfolgreich aktualisiert"
      );
      setEditingField(null);
    },
  });

  const handleStartEdit = (field: string, currentValue: string | null | string[]) => {
    setEditingField(field);
    if (Array.isArray(currentValue)) {
      setEditingValue(currentValue.join(", "));
    } else {
      setEditingValue(currentValue || "");
    }
  };

  const handleUpdate = (field: string, value: string) => {
    // Handle array fields
    if (["languages", "interests", "goals", "challenges"].includes(field)) {
      // Split by comma, trim whitespace, and filter out empty strings
      const arrayValue = value.split(",")
        .map(item => item.trim())
        .filter(Boolean);
      
      // Only update if we have valid values
      if (arrayValue.length > 0 || value === "") {
        updateLeadMutation.mutate({ [field]: arrayValue.length > 0 ? arrayValue : [] });
      }
    } else {
      updateLeadMutation.mutate({ [field]: value });
    }
  };

  const formatArrayField = (value: string[] | null): string => {
    if (!value || !Array.isArray(value)) return "";
    return value.join(", ");
  };

  const InfoRow = ({ 
    icon: Icon, 
    label, 
    value, 
    field 
  }: { 
    icon: any, 
    label: string, 
    value: string | null | string[], 
    field: string 
  }) => {
    const isEditing = editingField === field;
    const displayValue = Array.isArray(value) ? formatArrayField(value) : value;
    
    return (
      <div className="flex items-center gap-4 py-2 group">
        <Icon className="h-5 w-5 text-gray-500" />
        <div className="flex-1">
          {isEditing ? (
            <Input
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={() => handleUpdate(field, editingValue)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleUpdate(field, editingValue);
                } else if (e.key === "Escape") {
                  setEditingField(null);
                }
              }}
              autoFocus
              placeholder={label}
              className="max-w-md"
            />
          ) : (
            <div 
              onClick={() => handleStartEdit(field, value)}
              className="cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -ml-2"
            >
              <span className="text-sm text-gray-500">{label}</span>
              <span className="block">{displayValue || label}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Contact2 className="h-5 w-5" />
          {settings?.language === "en" ? "Contact Information" : "Kontakt Informationen"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            {settings?.language === "en" ? "Basic Information" : "Grundinformationen"}
          </h3>
          <InfoRow
            icon={Contact2}
            label={settings?.language === "en" ? "Name" : "Name"}
            value={lead.name}
            field="name"
          />
          <InfoRow
            icon={Building2}
            label={settings?.language === "en" ? "Company" : "Firma"}
            value={lead.company_name}
            field="company_name"
          />
          <InfoRow
            icon={Briefcase}
            label={settings?.language === "en" ? "Position" : "Position"}
            value={lead.position}
            field="position"
          />
        </div>

        {/* Contact Details */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            {settings?.language === "en" ? "Contact Details" : "Kontaktdetails"}
          </h3>
          <InfoRow
            icon={Phone}
            label={settings?.language === "en" ? "Phone" : "Telefon"}
            value={lead.phone_number}
            field="phone_number"
          />
          <InfoRow
            icon={Mail}
            label={settings?.language === "en" ? "Email" : "E-Mail"}
            value={lead.email}
            field="email"
          />
          <InfoRow
            icon={Globe}
            label={settings?.language === "en" ? "Website" : "Webseite"}
            value={lead.website}
            field="website"
          />
        </div>

        {/* Address */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            {settings?.language === "en" ? "Address" : "Adresse"}
          </h3>
          <InfoRow
            icon={MapPin}
            label={settings?.language === "en" ? "Street" : "Straße"}
            value={lead.street}
            field="street"
          />
          <InfoRow
            icon={MapPin}
            label={settings?.language === "en" ? "City" : "Stadt"}
            value={lead.city}
            field="city"
          />
          <InfoRow
            icon={MapPin}
            label={settings?.language === "en" ? "State" : "Bundesland"}
            value={lead.region}
            field="region"
          />
          <InfoRow
            icon={MapPin}
            label={settings?.language === "en" ? "Postal Code" : "Postleitzahl"}
            value={lead.postal_code}
            field="postal_code"
          />
          <InfoRow
            icon={MapPin}
            label={settings?.language === "en" ? "Country" : "Land"}
            value={lead.country}
            field="country"
          />
        </div>

        {/* Additional Information */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            {settings?.language === "en" ? "Additional Information" : "Zusätzliche Informationen"}
          </h3>
          <InfoRow
            icon={Calendar}
            label={settings?.language === "en" ? "Birth Date" : "Geburtsdatum"}
            value={lead.birth_date ? new Date(lead.birth_date).toLocaleDateString() : null}
            field="birth_date"
          />
          <InfoRow
            icon={MessageSquare}
            label={settings?.language === "en" ? "Preferred Contact Channel" : "Bevorzugter Kontaktkanal"}
            value={lead.preferred_communication_channel}
            field="preferred_communication_channel"
          />
          <InfoRow
            icon={Clock}
            label={settings?.language === "en" ? "Best Contact Times" : "Beste Erreichbarkeitszeit"}
            value={lead.best_contact_times}
            field="best_contact_times"
          />
          <InfoRow
            icon={Languages}
            label={settings?.language === "en" ? "Languages" : "Sprachen"}
            value={lead.languages}
            field="languages"
          />
        </div>

        {/* Interests & Goals */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            {settings?.language === "en" ? "Interests & Goals" : "Interessen & Ziele"}
          </h3>
          <InfoRow
            icon={Heart}
            label={settings?.language === "en" ? "Interests" : "Interessen"}
            value={lead.interests}
            field="interests"
          />
          <InfoRow
            icon={Target}
            label={settings?.language === "en" ? "Goals" : "Ziele"}
            value={lead.goals}
            field="goals"
          />
          <InfoRow
            icon={AlertCircle}
            label={settings?.language === "en" ? "Challenges" : "Herausforderungen"}
            value={lead.challenges}
            field="challenges"
          />
        </div>

        {/* Source Information */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            {settings?.language === "en" ? "Source Information" : "Herkunftsinformationen"}
          </h3>
          <InfoRow
            icon={Share2}
            label={settings?.language === "en" ? "Contact Source" : "Kontakt-Quelle"}
            value={lead.platform}
            field="platform"
          />
          <InfoRow
            icon={UserPlus}
            label={settings?.language === "en" ? "Referred By" : "Empfohlen durch"}
            value={lead.referred_by}
            field="referred_by"
          />
        </div>
      </CardContent>
    </Card>
  );
}
