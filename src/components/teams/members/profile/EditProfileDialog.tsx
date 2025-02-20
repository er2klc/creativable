import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, MapPin, Link as LinkIcon, Instagram, Linkedin, Mail, Info } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: {
    id: string;
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    personality_type?: string;
    location?: string;
    social_links?: {
      website?: string;
      instagram?: string;
      linkedin?: string;
    };
    email?: string;
  };
}

export function EditProfileDialog({ isOpen, onClose, profileData }: EditProfileDialogProps) {
  const { settings } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profileData.display_name || "",
    bio: settings?.about_me || profileData.bio || "",
    avatar_url: profileData.avatar_url || null,
    personality_type: profileData.personality_type || "",
    location: profileData.location || "",
    social_links: {
      website: profileData.social_links?.website || "",
      instagram: profileData.social_links?.instagram || "",
      linkedin: extractLinkedInUsername(profileData.social_links?.linkedin) || "",
    },
    email: profileData.email || ""
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (settings?.about_me) {
      setFormData(prev => ({ ...prev, bio: settings.about_me || prev.bio }));
    }
  }, [settings?.about_me]);

  function extractLinkedInUsername(url?: string): string {
    if (!url) return "";
    const match = url.match(/linkedin\.com\/in\/([^\/]+)/);
    return match ? match[1] : url.replace("https://linkedin.com/in/", "");
  }

  function formatLinkedInUrl(username: string): string {
    if (!username) return "";
    const cleanUsername = username.replace("https://linkedin.com/in/", "");
    return `https://linkedin.com/in/${cleanUsername}`;
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const fileExt = file.name.split('.').pop();
      const fileName = `${profileData.id}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (error) {
        toast.error('Fehler beim Hochladen des Bildes');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          personality_type: formData.personality_type,
          location: formData.location,
          social_links: {
            ...formData.social_links,
            linkedin: formatLinkedInUrl(formData.social_links.linkedin)
          },
          email: formData.email
        })
        .eq('id', profileData.id);

      if (error) throw error;

      toast.success('Profil erfolgreich aktualisiert');
      onClose();
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Profils');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col h-[85vh] p-0 gap-0 w-[95vw] sm:max-w-[400px]">
        <DialogHeader className="shrink-0 p-4 pb-2 border-b">
          <DialogTitle>Profil bearbeiten</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-[70px]">
          <div className="grid gap-4 py-4">
            <TeamLogoUpload
              currentLogoUrl={formData.avatar_url}
              onLogoChange={handleAvatarChange}
              onLogoRemove={() => setFormData(prev => ({ ...prev, avatar_url: null }))}
              logoPreview={avatarPreview}
            />

            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Dein Name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Über mich</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Erzähle etwas über dich..."
              />
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Persönlichkeitstyp
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px] p-4">
                      <p className="font-medium mb-2">Die 16 MBTI-Persönlichkeitstypen:</p>
                      <p className="mb-2">Jeder Typ (z.B. INFJ, ENTJ) setzt sich aus 4 Präferenzen zusammen:</p>
                      <ul className="space-y-1">
                        <li>• Introvertiert (I) vs. Extravertiert (E)</li>
                        <li>• Intuition (N) vs. Sensorik (S)</li>
                        <li>• Fühlen (F) vs. Denken (T)</li>
                        <li>• Urteilen (J) vs. Wahrnehmen (P)</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                value={formData.personality_type}
                onChange={(e) => setFormData(prev => ({ ...prev, personality_type: e.target.value }))}
                placeholder="z.B. INFJ, ENTJ..."
              />
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Standort
              </Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="z.B. Berlin, Deutschland"
              />
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Website
              </Label>
              <Input
                value={formData.social_links.website}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  social_links: { ...prev.social_links, website: e.target.value }
                }))}
                placeholder="https://..."
              />
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram Benutzername
              </Label>
              <Input
                value={formData.social_links.instagram}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  social_links: { ...prev.social_links, instagram: e.target.value }
                }))}
                placeholder="@username"
              />
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn Benutzername
              </Label>
              <Input
                value={formData.social_links.linkedin}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  social_links: { ...prev.social_links, linkedin: e.target.value }
                }))}
                placeholder="dein-benutzername"
              />
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
