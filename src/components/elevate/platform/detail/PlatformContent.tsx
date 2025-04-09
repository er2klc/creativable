
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Eye, FileText, Film } from "lucide-react";
import { EditUnitDialog } from "./EditUnitDialog";

interface PlatformContentProps {
  id: string;
  moduleTitle: string;
  title: string;
  description: string;
  videoUrl: string;
  documentUrl?: string;
  isCompleted?: boolean;
  onComplete?: () => void;
  onVideoProgress?: (progress: number) => void;
  savedProgress?: number;
  isAdmin?: boolean;
  onDelete?: () => Promise<void>;
  onUpdate?: (data: { title: string; description: string; videoUrl: string }) => Promise<void>;
}

export const PlatformContent = ({
  id,
  moduleTitle,
  title,
  description,
  videoUrl,
  documentUrl,
  isCompleted = false,
  onComplete,
  onVideoProgress,
  savedProgress = 0,
  isAdmin = false,
  onDelete,
  onUpdate
}: PlatformContentProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
          {isAdmin && (
            <Button variant="outline" size="icon" onClick={() => setShowEditDialog(true)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content sections */}
      {description && (
        <div className="prose prose-slate max-w-none">
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </div>
      )}

      {videoUrl && (
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={videoUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {documentUrl && (
        <div className="bg-muted p-4 rounded-lg flex items-center gap-3">
          <FileText className="h-5 w-5 text-blue-500" />
          <div className="flex-1">
            <p className="font-medium">Begleitdokument</p>
            <p className="text-sm text-muted-foreground">
              Ein ergänzendes Dokument steht zur Verfügung
            </p>
          </div>
          <Button variant="outline" size="sm">
            Öffnen
          </Button>
          <Button variant="outline" size="sm">
            Herunterladen
          </Button>
        </div>
      )}

      {isAdmin && onDelete && onUpdate && (
        <EditUnitDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          title={title}
          description={description}
          videoUrl={videoUrl}
          onUpdate={onUpdate}
          onDelete={onDelete}
          id={id}
          existingFiles={[]}
        />
      )}
    </div>
  );
};
