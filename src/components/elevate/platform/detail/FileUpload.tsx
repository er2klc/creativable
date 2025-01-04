import { Button } from "@/components/ui/button";
import { FileText, X, FileSpreadsheet } from "lucide-react";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  files: File[];
  existingFiles?: any[];
  onFileRemove: (index: number) => void;
}

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel', // xls
  'application/msword', // doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
];

export const FileUpload = ({ onFilesSelected, files, existingFiles = [], onFileRemove }: FileUploadProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(file => 
        ALLOWED_FILE_TYPES.includes(file.type)
      );
      
      if (selectedFiles.length !== Array.from(e.target.files).length) {
        alert("Einige Dateien wurden nicht hinzugefügt, da sie nicht unterstützt werden. Erlaubte Formate: JPG, PNG, PDF, CSV, Excel, Word");
      }
      
      onFilesSelected(selectedFiles);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
    }
    return <FileText className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FileText className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Klicken</span> oder Dateien hierher ziehen
            </p>
            <p className="text-xs text-gray-500">
              JPG, PNG, PDF, CSV, Excel, Word
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.csv,.xlsx,.xls,.doc,.docx"
            onChange={handleFileChange}
          />
        </label>
      </div>
      
      {(existingFiles.length > 0 || files.length > 0) && (
        <div className="space-y-2">
          {existingFiles.map((file, index) => (
            <div
              key={`existing-${index}`}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                {getFileIcon(file.file_type)}
                <span className="text-sm text-gray-700">{file.file_name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFileRemove(index)}
                className="hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {files.map((file, index) => (
            <div
              key={`new-${index}`}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                {getFileIcon(file.type)}
                <span className="text-sm text-gray-700">{file.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFileRemove(existingFiles.length + index)}
                className="hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};