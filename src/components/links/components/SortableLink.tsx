import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExternalLink, Youtube, Video, FileText, File, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserLink } from "@/pages/Links";
import { LinkActions } from "./LinkActions";
import { LinkPreview } from "./LinkPreview";
import { LinkEditDialog } from "./LinkEditDialog";

interface SortableLinkProps {
  link: UserLink;
  onUpdate: () => void;
}

const getYoutubeVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const getLinkIcon = (url: string) => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return <Youtube className="h-4 w-4 text-red-500" />;
  }
  if (url.includes('zoom.us')) {
    return <Video className="h-4 w-4 text-blue-500" />;
  }
  if (url.toLowerCase().endsWith('.pdf')) {
    return <FileText className="h-4 w-4 text-orange-500" />;
  }
  return <File className="h-4 w-4 text-gray-500" />;
};

export function SortableLink({ link, onUpdate }: SortableLinkProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const videoId = link.url.includes('youtube') ? getYoutubeVideoId(link.url) : null;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-2 p-2 bg-background rounded-lg group hover:bg-accent"
      >
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {getLinkIcon(link.url)}
            
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center"
              onClick={(e) => {
                if (videoId) {
                  e.preventDefault();
                  setShowPreview(true);
                }
              }}
            >
              {link.title}
              <ExternalLink className="h-4 w-4 ml-2 inline-block opacity-50" />
            </a>
          </div>
          
          <div className="text-sm text-muted-foreground pl-6">
            {link.url}
          </div>
        </div>
        
        <LinkActions
          link={link}
          onUpdate={onUpdate}
          onEdit={() => setIsEditing(true)}
        />
      </div>

      {videoId && (
        <LinkPreview
          isOpen={showPreview}
          onOpenChange={setShowPreview}
          title={link.title}
          videoId={videoId}
        />
      )}

      <LinkEditDialog
        link={link}
        isOpen={isEditing}
        onOpenChange={setIsEditing}
        onUpdate={onUpdate}
      />
    </>
  );
}