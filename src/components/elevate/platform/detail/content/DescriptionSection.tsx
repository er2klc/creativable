import { DocumentSection } from "../DocumentSection";

interface DescriptionSectionProps {
  title: string;
  description: string;
  existingFiles: Array<{ id: string; file_name: string; file_path: string; file_type: string }>;
  isAdmin: boolean;
  onDocumentDeleted: () => void;
}

export const DescriptionSection = ({
  title,
  description,
  existingFiles,
  isAdmin,
  onDocumentDeleted,
}: DescriptionSectionProps) => {
  return (
    <div className="col-span-8 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="prose max-w-none">
          {description?.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      {existingFiles && existingFiles.length > 0 && (
        <DocumentSection
          documents={existingFiles}
          isAdmin={isAdmin}
          onDocumentDeleted={onDocumentDeleted}
        />
      )}
    </div>
  );
};