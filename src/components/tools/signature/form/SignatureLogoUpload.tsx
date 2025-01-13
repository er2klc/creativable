import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";

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
    <div className="h-full w-full">
      <TeamLogoUpload
        currentLogoUrl={logoUrl}
        onLogoChange={onLogoChange}
        onLogoRemove={onLogoRemove}
        logoPreview={logoPreview}
      />
    </div>
  );
};
