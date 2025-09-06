import React from 'react';

interface TeamLogoUploadProps {
  currentLogoUrl?: string | null;
  onLogoChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoRemove?: () => void;
  logoPreview?: string | null;
}

export const TeamLogoUpload = ({
  currentLogoUrl,
  onLogoChange,
  onLogoRemove,
  logoPreview
}: TeamLogoUploadProps) => {
  return (
    <div className="flex items-center justify-center w-full h-32 border border-dashed border-gray-300 rounded-lg">
      <div className="text-center">
        <p className="text-sm text-gray-500">Logo Upload</p>
        {currentLogoUrl && (
          <img 
            src={logoPreview || currentLogoUrl} 
            alt="Logo" 
            className="max-h-20 max-w-20 mx-auto mt-2"
          />
        )}
      </div>
    </div>
  );
};