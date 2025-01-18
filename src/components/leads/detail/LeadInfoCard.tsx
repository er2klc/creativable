import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { Contact2, Building2, Briefcase, Phone, Mail, HelpCircle, Star } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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

  const handleStartEdit = (field: string, currentValue: string | null) => {
    setEditingField(field);
    setEditingValue(currentValue || "");
  };

  const handleUpdate = (field: string, value: string) => {
    updateLeadMutation.mutate({ [field]: value });
  };

  const handleContactTypeUpdate = (type: string) => {
    const currentTypes = lead.contact_type?.split(',') || [];
    let newTypes: string[];

    if (currentTypes.includes(type)) {
      newTypes = currentTypes.filter(t => t !== type);
    } else {
      newTypes = [...currentTypes, type];
    }
    
    updateLeadMutation.mutate({ 
      contact_type: newTypes.length > 0 ? newTypes.join(',') : null
    });
  };

  const InfoRow = ({ 
    icon: Icon, 
    label, 
    value, 
    field 
  }: { 
    icon: any, 
    label: string, 
    value: string | null, 
    field: string 
  }) => {
    const isEditing = editingField === field;
    
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
              <span>{value || label}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const currentTypes = lead.contact_type?.split(',') || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Contact2 className="h-5 w-5" />
          {settings?.language === "en" ? "Contact Information" : "Kontakt Informationen"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex gap-2 mb-4">
          <Button
            variant={currentTypes.includes('Partner') ? "default" : "outline"}
            size="sm"
            onClick={() => handleContactTypeUpdate('Partner')}
            className="flex items-center gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            Partner
          </Button>
          <Button
            variant={currentTypes.includes('Kunde') ? "default" : "outline"}
            size="sm"
            onClick={() => handleContactTypeUpdate('Kunde')}
            className="flex items-center gap-2"
          >
            <Star className="h-4 w-4" />
            Kunde
          </Button>
        </div>
        <div className="h-[1px] w-full bg-border mb-4" />
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
          label={settings?.language === "en" ? "Industry" : "Branche"}
          value={lead.industry}
          field="industry"
        />
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
      </CardContent>
    </Card>
  );
}