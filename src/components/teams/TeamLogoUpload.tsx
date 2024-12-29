import { Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface TeamLogoUploadProps {
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
      <Label>Team Logo</Label>
      <div className="flex flex-col items-center gap-4">
        {logoPreview ? (
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary/20">
            <img
              src={logoPreview}
              alt="Team logo preview"
              className="w-full h-full object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 bg-background/80 hover:bg-background"
              onClick={onLogoRemove}
            >
              ×
            </Button>
          </div>
        ) : (
          <div className="w-32 h-32 rounded-full border-2 border-dashed border-primary/20 flex items-center justify-center">
            <Image className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="flex justify-center">
          <Label
            htmlFor="logo-upload"
            className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Upload className="h-4 w-4 mr-2" />
            Logo hochladen
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onLogoChange}
            />
          </Label>
        </div>
      </div>
    </div>
  );
};