import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TeamLogoUpload } from "../TeamLogoUpload";

interface CreateTeamFormProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
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
  logoFile,
  setLogoFile,
  logoPreview,
  setLogoPreview,
}: CreateTeamFormProps) => {
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Team Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Geben Sie einen Team-Namen ein"
          />
        </div>
        <div>
          <Label htmlFor="description">Beschreibung</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschreiben Sie Ihr Team (optional)"
          />
        </div>
      </div>

      <TeamLogoUpload
        logoPreview={logoPreview}
        onLogoChange={handleLogoChange}
        onLogoRemove={() => {
          setLogoFile(null);
          setLogoPreview(null);
        }}
      />
    </div>
  );
};