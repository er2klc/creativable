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
    <div className="h-full w-full">
      {logoPreview ? (
        <div className="relative h-full w-full">
          <img src={logoPreview} alt="" className="h-full w-full object-cover rounded-md" style={{ height: '100%', width: '100%' }}/>
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
          <img src={currentLogoUrl} alt="" className="h-full w-full object-cover rounded-md" />
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
        <div className="h-full w-full border-dashed border-2 border-gray-300 flex items-center justify-center rounded-md">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={onLogoChange}
              className="hidden"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </label>
        </div>
      )}
    </div>
  );
};
