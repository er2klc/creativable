
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
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
  descriptionLength: number;
  maxLength: number;
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
  setLogoPreview,
  descriptionLength,
  maxLength
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
    <div className="space-y-6">
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
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor="description">Beschreibung</Label>
          <span className={`text-sm ${descriptionLength > maxLength ? "text-red-500" : "text-gray-500"}`}>
            {descriptionLength}/{maxLength}
          </span>
        </div>
        <div className="border rounded-md">
          <div className="sticky top-0 z-50 bg-background">
            <TiptapEditor
              content={description}
              onChange={setDescription}
            />
          </div>
        </div>
        {descriptionLength > maxLength && (
          <p className="text-xs text-red-500">
            Die Beschreibung ist zu lang. Bitte kürzen Sie sie auf maximal {maxLength} Zeichen.
          </p>
        )}
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

      <TeamLogoUpload
        logoPreview={logoPreview}
        onLogoChange={handleLogoChange}
        onLogoRemove={handleLogoRemove}
      />
    </div>
  );
};
