import { SignatureData } from "@/types/signature";
import { Button } from "@/components/ui/button";
import { SignaturePersonalInfo } from "./form/SignaturePersonalInfo";
import { SignatureSocialMedia } from "./form/SignatureSocialMedia";
import { SignatureLogoUpload } from "./form/SignatureLogoUpload";
import { SignatureColorSettings } from "./form/SignatureColorSettings";

interface SignatureFormProps {
  signatureData: SignatureData;
  onChange: (data: SignatureData) => void;
  onLogoChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoRemove?: () => void;
  logoPreview?: string | null;
  onSave?: () => void;
}

export const SignatureForm = ({ 
  signatureData, 
  onChange,
  onLogoChange,
  onLogoRemove,
  logoPreview,
  onSave
}: SignatureFormProps) => {
  return (
    <div className="space-y-8">
      <div className="flex gap-6">
        <div className="w-1/4">
          <SignatureLogoUpload
            logoUrl={signatureData.logoUrl}
            onLogoChange={onLogoChange}
            onLogoRemove={onLogoRemove}
            logoPreview={logoPreview}
          />
        </div>
        <div className="w-3/4">
          <SignaturePersonalInfo
            data={signatureData}
            onChange={onChange}
          />
        </div>
      </div>

      <SignatureSocialMedia
        data={signatureData}
        onChange={onChange}
      />

      <SignatureColorSettings
        data={signatureData}
        onChange={onChange}
      />

      {onSave && (
        <div className="flex justify-end pt-6">
          <Button 
            onClick={onSave}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
          >
            Speichern
          </Button>
        </div>
      )}
    </div>
  );
};