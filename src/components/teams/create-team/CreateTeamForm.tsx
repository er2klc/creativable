import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { TeamLogoUpload } from "../TeamLogoUpload";

interface CreateTeamFormProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  videoUrl: string;
  setVideoUrl: (url: string) => void;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  logoPreview: string | null;
  setLogoPreview: (preview: string | null) => void;
}

export const CreateTeamForm = ({
  name,
  setName,
  description,
  setDescription,
  videoUrl,
  setVideoUrl,
  logoFile,
  setLogoFile,
  logoPreview,
  setLogoPreview
}: CreateTeamFormProps) => {
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
        <Label htmlFor="name">Team Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Geben Sie einen Team-Namen ein"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Beschreibung</Label>
        <RichTextEditor
          content={description}
          onChange={setDescription}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="videoUrl">Team Video URL (optional)</Label>
        <Input
          id="videoUrl"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Fügen Sie eine Video-URL hinzu"
        />
      </div>
      <div className="space-y-2">
        <Label>Team Foto</Label>
        <TeamLogoUpload
          logoPreview={logoPreview}
          onLogoChange={handleLogoChange}
          onLogoRemove={handleLogoRemove}
        />
      </div>
    </div>
  );
};