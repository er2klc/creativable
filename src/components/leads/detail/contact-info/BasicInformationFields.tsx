import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { InfoRow } from "./InfoRow";
import { ContactInfoGroup } from "./ContactInfoGroup";
import { User, AtSign, Phone, Globe, Calendar, Building2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BasicInformationFieldsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function BasicInformationFields({ lead, onUpdate }: BasicInformationFieldsProps) {
  const { settings } = useSettings();
  const [showEmptyFields, setShowEmptyFields] = useState(true);
  const [newTag, setNewTag] = useState("");

  const fields = [
    { icon: User, label: settings?.language === "en" ? "Name" : "Name", field: "name", value: lead.name },
    { icon: AtSign, label: "E-Mail", field: "email", value: lead.email },
    { icon: Phone, label: settings?.language === "en" ? "Phone" : "Telefon", field: "phone_number", value: lead.phone_number },
    { icon: Globe, label: settings?.language === "en" ? "Website" : "Webseite", field: "website", value: lead.website },
    { icon: Calendar, label: settings?.language === "en" ? "Birth Date" : "Geburtsdatum", field: "birth_date", value: lead.birth_date },
    { icon: Building2, label: settings?.language === "en" ? "Company" : "Firma", field: "company_name", value: lead.company_name },
    { icon: MapPin, label: settings?.language === "en" ? "City" : "Stadt", field: "city", value: lead.city },
  ];

  const handleAddTag = (type: "interests" | "goals" | "challenges") => {
    if (!newTag.trim()) return;
    
    const currentTags = lead[type] || [];
    if (!currentTags.includes(newTag)) {
      onUpdate({
        [type]: [...currentTags, newTag.startsWith("#") ? newTag : `#${newTag}`]
      });
    }
    setNewTag("");
  };

  const handleRemoveTag = (type: "interests" | "goals" | "challenges", tag: string) => {
    const currentTags = lead[type] || [];
    onUpdate({
      [type]: currentTags.filter(t => t !== tag)
    });
  };

  const getTagStyle = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case "linkedin":
        return "bg-[#0077B5] text-white hover:bg-[#006097]";
      case "instagram":
        return "bg-[#E1306C] text-white hover:bg-[#C13584]";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const TagSection = ({ type, title }: { type: "interests" | "goals" | "challenges", title: string }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder={`${title} hinzufügen`}
          className="flex-1"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddTag(type);
            }
          }}
        />
        <Button 
          onClick={() => handleAddTag(type)}
          size="sm"
          variant="outline"
        >
          +
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(lead[type] || []).map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className={cn(
              "flex items-center gap-1 px-3 py-1",
              getTagStyle(lead.platform)
            )}
          >
            {tag}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent text-current"
              onClick={() => handleRemoveTag(type, tag)}
            >
              ×
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );

  const visibleFields = showEmptyFields 
    ? fields 
    : fields.filter(field => field.value);

  return (
    <>
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
      </ContactInfoGroup>

      <ContactInfoGroup
        title={settings?.language === "en" ? "Interests & Goals" : "Interessen & Ziele"}
        leadId={lead.id}
        showEmptyFields={true}
        groupName="interests_goals"
      >
        <div className="space-y-4">
          <TagSection type="interests" title={settings?.language === "en" ? "Interest" : "Interesse"} />
          <TagSection type="goals" title={settings?.language === "en" ? "Goal" : "Ziel"} />
          <TagSection type="challenges" title={settings?.language === "en" ? "Challenge" : "Herausforderung"} />
        </div>
      </ContactInfoGroup>
    </>
  );
}