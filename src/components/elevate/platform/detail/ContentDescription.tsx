import { FileText, FileSpreadsheet, File } from "lucide-react";

interface ContentDescriptionProps {
  title: string;
  description: string;
  existingFiles: Array<{ file_name: string; file_path: string }>;
}

export const ContentDescription = ({
  title,
  description,
  existingFiles,
}: ContentDescriptionProps) => {
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
      case 'pdf':
        return <File className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-white">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-gray-600 whitespace-pre-wrap">{description}</p>
      
      {existingFiles && existingFiles.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Lerndokumente</h3>
          <div className="space-y-2">
            {existingFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2">
                {getFileIcon(file.file_name)}
                <a
                  href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/elevate-documents/${file.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {file.file_name}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};