import { Card } from "@/components/ui/card";

interface ContentDescriptionProps {
  title: string;
  description: string;
  existingFiles?: Array<{
    file_name: string;
    file_path: string;
  }>;
}

export const ContentDescription = ({
  title,
  description,
  existingFiles,
}: ContentDescriptionProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: description }} 
      />
    </Card>
  );
};