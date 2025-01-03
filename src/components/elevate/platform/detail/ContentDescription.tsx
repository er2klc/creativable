interface ContentDescriptionProps {
  title: string;
  description: string;
  existingFiles?: any[];
}

export const ContentDescription = ({
  title,
  description,
  existingFiles
}: ContentDescriptionProps) => {
  return (
    <div className="space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
      
      {existingFiles && existingFiles.length > 0 && (
        <div className="mt-8 pt-6 border-t">
          <h3 className="font-medium mb-4">Lerndokumente</h3>
          <div className="space-y-2">
            {existingFiles.map((file) => (
              <div key={file.id} className="flex items-center p-2 bg-white rounded-lg">
                <span className="text-sm">{file.file_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};