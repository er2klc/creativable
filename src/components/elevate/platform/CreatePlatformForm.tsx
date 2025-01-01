import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@supabase/auth-helpers-react";

interface CreatePlatformFormProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  logoPreview: string | null;
  setLogoPreview: (preview: string | null) => void;
  selectedModules: string[];
  setSelectedModules: (modules: string[]) => void;
}

export const CreatePlatformForm = ({
  name,
  setName,
  description,
  setDescription,
  logoFile,
  setLogoFile,
  logoPreview,
  setLogoPreview,
  selectedModules,
  setSelectedModules
}: CreatePlatformFormProps) => {
  const user = useUser();

  const { data: existingModules = [] } = useQuery({
    queryKey: ['existing-modules'],
    queryFn: async () => {
      try {
        if (!user?.id) return [];

        const { data, error } = await supabase
          .from('elevate_platforms')
          .select('id, name')
          .eq('created_by', user.id) // Nur Module des eingeloggten Users
          .order('name');

        if (error) {
          console.error('Error loading existing modules:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Unexpected error loading modules:', error);
        return [];
      }
    },
    enabled: !!user?.id
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules(
      selectedModules.includes(moduleId)
        ? selectedModules.filter(id => id !== moduleId)
        : [...selectedModules, moduleId]
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Modulname</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Geben Sie einen Modulnamen ein"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Beschreiben Sie Ihr Modul (optional)"
        />
      </div>
      <div className="space-y-2">
        <TeamLogoUpload
          logoPreview={logoPreview}
          onLogoChange={handleLogoChange}
          onLogoRemove={handleLogoRemove}
        />
      </div>
      {existingModules.length > 0 && (
        <div className="space-y-2">
          <Label>Modulserie</Label>
          <p className="text-sm text-muted-foreground">
            Wählen Sie Module aus, die zu dieser Serie gehören sollen
          </p>
          <ScrollArea className="h-[200px] border rounded-md p-4">
            <div className="space-y-4">
              {existingModules.map((module) => (
                <div key={module.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={module.id}
                    checked={selectedModules.includes(module.id)}
                    onCheckedChange={() => handleModuleToggle(module.id)}
                  />
                  <label
                    htmlFor={module.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {module.name}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};