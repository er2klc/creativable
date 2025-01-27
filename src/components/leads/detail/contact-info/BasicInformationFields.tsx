import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { InfoRow } from "./InfoRow";
import { ContactInfoGroup } from "./ContactInfoGroup";
import { User, AtSign, Phone, Globe, Calendar, Building2, MapPin, Hash, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BasicInformationFieldsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function BasicInformationFields({ lead, onUpdate }: BasicInformationFieldsProps) {
  const { settings } = useSettings();
  const [showEmptyFields, setShowEmptyFields] = useState(true);
  const [newTag, setNewTag] = useState("");
  const [showTagDialog, setShowTagDialog] = useState(false);

  const handleAddTag = (tag: string) => {
    if (!tag.trim()) return;
    
    const allTags = lead.interests || [];
    // Only add # if it's not already present
    const newTag = tag.startsWith('#') ? tag : `#${tag}`;
    
    if (!allTags.includes(newTag)) {
      onUpdate({
        interests: [...allTags, newTag]
      });
    }
    setNewTag("");
    setShowTagDialog(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = lead.interests || [];
    onUpdate({
      interests: currentTags.filter(t => t !== tagToRemove)
    });
  };

  // Get unique hashtags from social media posts
  const getUniqueHashtagsFromPosts = () => {
    if (!Array.isArray(lead.social_media_posts)) return [];
    
    const hashtags = new Set<string>();
    lead.social_media_posts.forEach((post: any) => {
      if (post.hashtags) {
        post.hashtags.forEach((tag: string) => {
          // Add hashtag if it doesn't have one
          const tagWithHash = tag.startsWith('#') ? tag : `#${tag}`;
          hashtags.add(tagWithHash);
        });
      }
    });
    return Array.from(hashtags);
  };

  // Combine manual tags and social media hashtags, removing duplicates
  const getAllUniqueTags = () => {
    const manualTags = lead.interests || [];
    const socialHashtags = getUniqueHashtagsFromPosts();
    const allTags = new Set([...manualTags, ...socialHashtags]);
    return Array.from(allTags);
  };

  const fields = [
    { icon: User, label: settings?.language === "en" ? "Name" : "Name", field: "name", value: lead.name },
    { icon: AtSign, label: "Email", field: "email", value: lead.email },
    { icon: Phone, label: settings?.language === "en" ? "Phone" : "Telefon", field: "phone_number", value: lead.phone_number },
    { icon: Globe, label: settings?.language === "en" ? "Website" : "Webseite", field: "website", value: lead.website },
    { icon: Calendar, label: settings?.language === "en" ? "Birth Date" : "Geburtsdatum", field: "birth_date", value: lead.birth_date },
    { icon: Building2, label: settings?.language === "en" ? "Company" : "Firma", field: "company_name", value: lead.company_name },
    { icon: MapPin, label: settings?.language === "en" ? "Address" : "Adresse", field: "address", value: lead.address }
  ];

  const visibleFields = showEmptyFields 
    ? fields 
    : fields.filter(field => field.value);

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
      </ContactInfoGroup>

      <ContactInfoGroup
        title={settings?.language === "en" ? "Interests & Goals" : "Interessen & Ziele"}
        leadId={lead.id}
        showEmptyFields={true}
        groupName="interests_goals"
        rightIcon={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTagDialog(true)}
            className="p-0 hover:bg-transparent"
          >
            <Plus className="h-4 w-4 text-gray-500" />
          </Button>
        }
      >
        <div className="flex flex-wrap gap-2">
          {getAllUniqueTags().map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 text-xs",
                tag.startsWith('#') ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              )}
            >
              {tag.startsWith('#') && <Hash className="h-2.5 w-2.5" />}
              {tag}
              <Button
                variant="ghost"
                size="sm"
                className="h-3 w-3 p-0 hover:bg-transparent text-current"
                onClick={() => handleRemoveTag(tag)}
              >
                ×
              </Button>
            </Badge>
          ))}
        </div>
      </ContactInfoGroup>

      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {settings?.language === "en" ? "Add Tag" : "Tag hinzufügen"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder={settings?.language === "en" ? "Enter tag" : "Tag eingeben"}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag(newTag);
                }
              }}
            />
            <Button onClick={() => handleAddTag(newTag)}>
              {settings?.language === "en" ? "Add" : "Hinzufügen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}