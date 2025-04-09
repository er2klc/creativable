
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface UnitFormProps {
  initialContent: {
    title: string;
    description: string;
    videoUrl: string;
  };
  onContentChange: (data: {
    title: string;
    description: string;
    videoUrl: string;
  }) => void;
  existingFiles?: string[];
}

export const UnitForm = ({
  initialContent,
  onContentChange,
  existingFiles = [],
}: UnitFormProps) => {
  const handleChange = (
    field: "title" | "description" | "videoUrl",
    value: string
  ) => {
    onContentChange({
      ...initialContent,
      [field]: value,
    });
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">
          Titel
        </Label>
        <Input
          id="title"
          value={initialContent.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">
          Beschreibung
        </Label>
        <Textarea
          id="description"
          rows={3}
          value={initialContent.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="videoUrl">
          Video URL
        </Label>
        <Input
          id="videoUrl"
          value={initialContent.videoUrl}
          onChange={(e) => handleChange("videoUrl", e.target.value)}
        />
      </div>
      {existingFiles && existingFiles.length > 0 && (
        <div className="grid gap-2">
          <Label>Existierende Dateien</Label>
          <div className="text-sm text-muted-foreground">
            {existingFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2">
                <span>{file}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
