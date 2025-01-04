import { ContentDescription } from "../ContentDescription";

interface DescriptionSectionProps {
  title: string;
  description: string;
  existingFiles?: Array<{
    file_name: string;
    file_path: string;
  }>;
  isAdmin?: boolean;
  onDocumentDeleted?: () => Promise<void>;
}

export const DescriptionSection = ({
  title,
  description,
  existingFiles,
  isAdmin,
  onDocumentDeleted,
}: DescriptionSectionProps) => {
  return (
    <div className="col-span-8">
      <ContentDescription
        title={title}
        description={description}
        existingFiles={existingFiles}
      />
    </div>
  );
};