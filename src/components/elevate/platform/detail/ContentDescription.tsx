interface ContentDescriptionProps {
  title: string;
  description: string;
  existingFiles: any[];
}

export const ContentDescription = ({
  title,
  description,
  existingFiles,
}: ContentDescriptionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-gray-600 whitespace-pre-wrap">{description}</p>
      
      {existingFiles && existingFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Lerndokumente</h3>
          <div className="space-y-2">
            {existingFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2">
                <a
                  href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/elevate-documents/${file.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 underline"
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