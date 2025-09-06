import { Input } from "@/components/ui/input";
import { UserCircle } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface BioAndInterestsFieldsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function BioAndInterestsFields({ lead, onUpdate }: BioAndInterestsFieldsProps) {
  const { settings } = useSettings();
  const [newInterest, setNewInterest] = useState("");

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

  return (
    <>
      <div className="col-span-2">
        <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2 antialiased">
          <UserCircle className="h-4 w-4 text-gray-900" />
          Bio
        </dt>
        <dd>
          <Textarea
            value={lead.social_media_bio || ""}
            onChange={(e) => onUpdate({ social_media_bio: e.target.value })}
            placeholder={settings?.language === "en" ? "Enter bio" : "Bio eingeben"}
            className="min-h-[150px] antialiased"
          />
        </dd>
      </div>
      <div className="col-span-2">
        <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2 antialiased">
          <UserCircle className="h-4 w-4 text-gray-900" />
          {settings?.language === "en" ? "Interests/Skills/Positives" : "Interessen/Skills/Positives"}
        </dt>
        <dd className="space-y-2">
          <div className="flex gap-2">
            <Input
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
                  className="flex items-center gap-1 antialiased"
                >
                  {interest}
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
        </dd>
      </div>
    </>
  );
}