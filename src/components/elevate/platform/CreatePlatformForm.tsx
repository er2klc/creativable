import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";

interface CreatePlatformFormProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  logoPreview: string | null;
  setLogoPreview: (preview: string | null) => void;
}

export const CreatePlatformForm = ({
  name,
  setName,
  description,
  setDescription,
  logoFile,
  setLogoFile,
  logoPreview,
  setLogoPreview
}: CreatePlatformFormProps) => {
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

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name der Plattform</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Geben Sie einen Namen ein"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Beschreiben Sie Ihre Plattform (optional)"
        />
      </div>
      <TeamLogoUpload
        logoPreview={logoPreview}
        onLogoChange={handleLogoChange}
        onLogoRemove={handleLogoRemove}
      />
    </div>
  );
};