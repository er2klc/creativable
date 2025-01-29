import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { InfoRow } from "./InfoRow";
import { ContactInfoGroup } from "./ContactInfoGroup";
import { User, AtSign, Phone, Globe, Calendar, Building2, MapPin, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface BasicInformationFieldsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function BasicInformationFields({ lead, onUpdate }: BasicInformationFieldsProps) {
  const { settings } = useSettings();
  const [showEmptyFields, setShowEmptyFields] = useState(true);
  const [newInterest, setNewInterest] = useState("");

  const fields = [
    { icon: User, label: settings?.language === "en" ? "Name" : "Name", field: "name", value: lead.name },
    { icon: AtSign, label: "Email", field: "email", value: lead.email },
    { icon: Phone, label: settings?.language === "en" ? "Phone" : "Telefon", field: "phone_number", value: lead.phone_number },
    { icon: Globe, label: settings?.language === "en" ? "Website" : "Webseite", field: "website", value: lead.website },
    { icon: Calendar, label: settings?.language === "en" ? "Birth Date" : "Geburtsdatum", field: "birth_date", value: lead.birth_date },
    { icon: Building2, label: settings?.language === "en" ? "Company" : "Firma", field: "company_name", value: lead.company_name },
    { icon: MapPin, label: settings?.language === "en" ? "City" : "Stadt", field: "city", value: lead.city }
  ];

  const visibleFields = showEmptyFields 
    ? fields 
    : fields.filter(field => field.value);

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    
    const currentInterests = lead.social_media_interests || [];
    if (!currentInterests.includes(newInterest)) {
      onUpdate({
        social_media_interests: [...currentInterests, newInterest]
      });
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interest: string) => {
    const currentInterests = lead.social_media_interests || [];
    onUpdate({
      social_media_interests: currentInterests.filter(i => i !== interest)
    });
  };

  const getInterestColor = (interest: string) => {
    if (lead.platform === 'instagram') {
      return 'bg-[#ea384c]/10 text-[#ea384c] hover:bg-[#ea384c]/20';
    }
    if (lead.platform === 'linkedin') {
      return 'bg-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5]/20';
    }
    return 'bg-gray-100 hover:bg-gray-200';
  };

  return (
    <div className="mt-8 space-y-6">
      <ContactInfoGroup
        title={settings?.language === "en" ? "Basic Information" : "Basis Informationen"}
        leadId={lead.id}
        showEmptyFields={showEmptyFields}
        onToggleEmptyFields={() => setShowEmptyFields(!showEmptyFields)}
        groupName="basic_info"
      >
        {visibleFields.map((field) => (
          <InfoRow
            key={field.field}
            icon={field.icon}
            label={field.label}
            value={field.value}
            field={field.field}
            onUpdate={onUpdate}
          />
        ))}

        <ContactInfoGroup
          title={settings?.language === "en" ? "Interests & Skills" : "Interessen & Skills"}
          leadId={lead.id}
          showEmptyFields={true}
          groupName="interests_goals"
          rightIcon={
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                const input = document.getElementById('new-interest-input');
                if (input) {
                  input.focus();
                }
              }}
            >
              +
            </Button>
          }
        >
          <div className="col-span-2">
            <div className="flex gap-2 mb-2">
              <Input
                id="new-interest-input"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder={settings?.language === "en" ? "Add new interest/skill" : "Neue Interesse/Skill hinzufügen"}
                className="antialiased"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInterest();
                  }
                }}
              />
              <Button 
                onClick={handleAddInterest}
                type="button"
                className="antialiased"
              >
                {settings?.language === "en" ? "Add" : "Hinzufügen"}
              </Button>
            </div>
            <ScrollArea className="h-24 w-full rounded-md border">
              <div className="p-4 flex flex-wrap gap-2">
                {(lead.social_media_interests || []).map((interest, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className={cn(
                      "flex items-center gap-1 antialiased font-normal",
                      getInterestColor(interest)
                    )}
                  >
                    #{interest}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveInterest(interest)}
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>
        </ContactInfoGroup>
      </ContactInfoGroup>
    </div>
  );
}