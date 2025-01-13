import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";
import { Label } from "@/components/ui/label";

interface SignatureLogoUploadProps {
  logoUrl: string | null;
  onLogoChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoRemove?: () => void;
  logoPreview?: string | null;
}

export const SignatureLogoUpload = ({
  logoUrl,
  onLogoChange,
  onLogoRemove,
  logoPreview
}: SignatureLogoUploadProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-lg">Logo</Label>
      <div className="w-full aspect-square">
        <TeamLogoUpload
          currentLogoUrl={logoUrl}
          onLogoChange={onLogoChange}
          onLogoRemove={onLogoRemove}
          logoPreview={logoPreview}
        />
      </div>
    </div>
  );
};