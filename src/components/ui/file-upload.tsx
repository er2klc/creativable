
import { useState } from "react";
import { Button } from "./button";
import { UploadCloud, X } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (urls: string[]) => void;
  existingFiles?: string[];
  folder?: string;
  maxFiles?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  existingFiles = [],
  folder = "uploads",
  maxFiles = 10,
}) => {
  const [files, setFiles] = useState<string[]>(existingFiles || []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // In a real app, you would upload the files to a server
      // Here we're just creating fake URLs
      const newUrls = Array.from(e.target.files).map(
        (file) => URL.createObjectURL(file)
      );
      const updatedFiles = [...files, ...newUrls].slice(0, maxFiles);
      setFiles(updatedFiles);
      onFileSelect(updatedFiles);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFileSelect(updatedFiles);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {files.map((file, index) => (
          <div
            key={index}
            className="relative bg-gray-100 rounded-md p-2 flex items-center gap-2"
          >
            <a
              href={file}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline max-w-[150px] truncate"
            >
              {file.split("/").pop()}
            </a>
            <button
              type="button"
              onClick={() => removeFile(index)}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {files.length < maxFiles && (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
          <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 mb-2">
            Drag files here or click to upload
          </p>
          <input
            type="file"
            multiple
            className="hidden"
            id="file-upload"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <Button type="button" variant="outline" size="sm">
              Upload Files
            </Button>
          </label>
        </div>
      )}
    </div>
  );
};
