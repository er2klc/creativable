interface TeamLogoUploadProps {
  currentLogoUrl?: string | null;
  onLogoChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoRemove?: () => void;
  teamId?: string;
  logoPreview?: string | null;
}

export const TeamLogoUpload = ({
  currentLogoUrl,
  onLogoChange,
  onLogoRemove,
  logoPreview
}: TeamLogoUploadProps) => {
  return (
    <div className="space-y-2">
      {logoPreview ? (
        <div className="relative">
          <img src={logoPreview} alt="Logo Preview" className="w-full h-32 object-cover rounded-md" />
          <button
            type="button"
            onClick={onLogoRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
          >
            X
          </button>
        </div>
      ) : currentLogoUrl ? (
        <div className="relative">
          <img src={currentLogoUrl} alt="Current Logo" className="w-full h-32 object-cover rounded-md" />
          <button
            type="button"
            onClick={onLogoRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
          >
            X
          </button>
        </div>
      ) : (
        <div className="h-32 border-dashed border-2 border-gray-300 flex items-center justify-center rounded-md">
          <label className="cursor-pointer">
            <span className="text-gray-500">Logo hochladen</span>
            <input
              type="file"
              accept="image/*"
              onChange={onLogoChange}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
};
