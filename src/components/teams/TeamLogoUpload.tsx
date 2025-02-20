
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">Team Logo</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-gray-500 hover:text-gray-700">
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[280px] p-3">
              <h4 className="font-medium mb-2">Optimale Bildgrößen:</h4>
              <ul className="text-xs space-y-1">
                <li>• Empfohlene Größe: 1280 x 720 Pixel</li>
                <li>• Optimales Seitenverhältnis: 16:9</li>
                <li>• Minimale Breite: 640 Pixel</li>
                <li>• Maximale Dateigröße: 2MB</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="h-[180px]">
        {logoPreview ? (
          <div className="relative h-full w-full">
            <img 
              src={logoPreview} 
              alt="" 
              className="max-h-[180px] w-full object-contain rounded-md"
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
              className="max-h-[180px] w-full object-contain rounded-md"
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
    </div>
  );
};
