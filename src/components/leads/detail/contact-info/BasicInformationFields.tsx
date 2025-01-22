import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { InfoRow } from "./InfoRow";
import { ContactInfoGroup } from "./ContactInfoGroup";
import { User, AtSign, Phone, Globe, Calendar, Building2, MapPin, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const handleAddTag = (tag: string) => {
    if (!tag.trim()) return;
    
    const allTags = lead.interests || [];
    if (!allTags.includes(tag)) {
      onUpdate({
        interests: [...allTags, tag.startsWith("#") ? tag : `#${tag}`]
      });
    }
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = lead.interests || [];
    onUpdate({
      interests: currentTags.filter(t => t !== tagToRemove)
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
        rightIcon={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-transparent">
                <Plus className="h-4 w-4 text-gray-500 hover:text-gray-900" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              <div className="flex flex-col gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder={settings?.language === "en" ? "Add tag" : "Tag hinzufügen"}
                  className="h-8"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(newTag);
                    }
                  }}
                />
                <Button 
                  onClick={() => handleAddTag(newTag)}
                  size="sm"
                  className="w-full"
                >
                  {settings?.language === "en" ? "Add" : "Hinzufügen"}
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      >
        <div className="flex flex-wrap gap-2">
          {(lead.interests || []).map((tag, index) => (
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
                onClick={() => handleRemoveTag(tag)}
              >
                ×
              </Button>
            </Badge>
          ))}
        </div>
      </ContactInfoGroup>
    </>
  );
}