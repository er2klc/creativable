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
    <div className="h-full">
      {logoPreview ? (
        <div className="relative h-full">
          <img src={logoPreview} alt="" className="h-full w-full object-contain rounded-md" />
          <button
            type="button"
            onClick={onLogoRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
          >
            X
          </button>
        </div>
      ) : currentLogoUrl ? (
        <div className="relative h-full">
          <img src={currentLogoUrl} alt="" className="h-full w-full object-contain rounded-md" />
          <button
            type="button"
            onClick={onLogoRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
          >
            X
          </button>
        </div>
      ) : (
        <div className="h-full border-dashed border-2 border-gray-300 flex items-center justify-center rounded-md">
          <label className="cursor-pointer">
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