import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Upload } from "lucide-react";

export interface TeamLogoUploadProps {
  logoPreview: string | null;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoRemove: () => void;
}

export const TeamLogoUpload = ({
  logoPreview,
  onLogoChange,
  onLogoRemove,
}: TeamLogoUploadProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept="image/*"
          onChange={onLogoChange}
          className="hidden"
          id="logo-upload"
        />
        <label
          htmlFor="logo-upload"
          className="flex-1"
        >
          <Button
            type="button"
            variant="outline"
            className="w-full"
            asChild
          >
            <span>
              <Upload className="h-5 w-5 mr-2" />
              Team Foto auswählen
            </span>
          </Button>
        </label>
        {logoPreview && (
          <Button
            type="button"
            variant="outline"
            onClick={onLogoRemove}
            className="px-3"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>
      {logoPreview && (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
          <img
            src={logoPreview}
            alt="Preview"
            className="object-cover w-full h-full"
          />
        </div>
      )}
    </div>
  );
};