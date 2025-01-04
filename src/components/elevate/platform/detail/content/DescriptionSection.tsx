import { DocumentSection } from "../DocumentSection";

interface Document {
  name: string;
  url: string;
  id?: string;
  file_path?: string;
  file_type?: string;
}

interface DescriptionSectionProps {
  title: string;
  description: string;
  existingFiles: Array<{ id: string; file_name: string; file_path: string; file_type: string; }>;
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
  const documents: Document[] = existingFiles?.map(file => ({
    id: file.id,
    name: file.file_name,
    url: `https://agqaitxlmxztqyhpcjau.supabase.co/storage/v1/object/public/elevate-documents/${file.file_path}`,
    file_path: file.file_path,
    file_type: file.file_type
  })) || [];

  return (
    <div className="col-span-8 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: description }} />
      </div>

      {documents.length > 0 && (
        <DocumentSection
          documents={documents}
          isAdmin={isAdmin}
          onDocumentDeleted={onDocumentDeleted}
        />
      )}
    </div>
  );
};