interface TeamLogoUploadProps {
  logoPreview: string | null;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoRemove: () => void;
}

export const TeamLogoUpload = ({
  logoPreview,
  onLogoChange,
  onLogoRemove
}: TeamLogoUploadProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="file"
          onChange={onLogoChange}
          accept="image/*"
          className="hidden"
          id="team-logo-upload"
        />
        <label
          htmlFor="team-logo-upload"
          className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Team Foto auswählen
        </label>
        {logoPreview && (
          <button
            onClick={onLogoRemove}
            type="button"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Foto entfernen
          </button>
        )}
      </div>
      {logoPreview && (
        <div className="relative w-full h-48">
          <img
            src={logoPreview}
            alt="Team logo preview"
            className="w-full h-full object-cover rounded-md"
          />
        </div>
      )}
    </div>
  );
};