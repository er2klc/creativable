
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
    <div className="space-y-2">
      <div className="h-[240px]">
        {logoPreview ? (
          <div className="relative h-full w-full">
            <img 
              src={logoPreview} 
              alt="" 
              className="max-h-[240px] w-full object-contain rounded-md"
            />
            <button
              type="button"
              onClick={onLogoRemove}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ) : currentLogoUrl ? (
          <div className="relative h-full w-full">
            <img 
              src={currentLogoUrl} 
              alt="" 
              className="max-h-[240px] w-full object-contain rounded-md"
            />
            <button
              type="button"
              onClick={onLogoRemove}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="h-full w-full border-dashed border-2 border-gray-300 flex items-center justify-center rounded-md bg-gray-50">
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={onLogoChange}
                className="hidden"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm text-gray-500">Logo hochladen</span>
            </label>
          </div>
        )}
      </div>
      <div className="bg-gray-50 p-3 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Optimale Bildgrößen:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Empfohlene Größe: 1200 x 630 Pixel</li>
          <li>• Optimales Seitenverhältnis: 1.91:1 (Querformat)</li>
          <li>• Minimale Breite: 600 Pixel</li>
          <li>• Maximale Dateigröße: 2MB</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          Tipp: Verwenden Sie ein Bild im Querformat für die beste Darstellung in allen Bereichen.
        </p>
      </div>
    </div>
  );
};
