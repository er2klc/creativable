import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, X } from "lucide-react";

export interface TeamLogoUploadProps {
  logoPreview?: string | null;
  currentLogoUrl?: string | null;
  onLogoChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoRemove?: () => void;
}

export const TeamLogoUpload = ({
  logoPreview,
  currentLogoUrl,
  onLogoChange,
  onLogoRemove
}: TeamLogoUploadProps) => {
  return (
    <div className="space-y-2">
      <Label>Team Foto</Label>
      <div className="flex items-center gap-4">
        {(logoPreview || currentLogoUrl) && (
          <div className="relative w-24 h-24">
            <img
              src={logoPreview || currentLogoUrl || ''}
              alt="Logo preview"
              className="w-full h-full object-cover rounded-lg"
            />
            {onLogoRemove && (
              <button
                onClick={onLogoRemove}
                className="absolute -top-2 -right-2 p-1 bg-background rounded-full shadow-sm hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        <div className="flex-1">
          <Input
            type="file"
            accept="image/*"
            onChange={onLogoChange}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};