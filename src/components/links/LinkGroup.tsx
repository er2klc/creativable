import { useState } from "react";
import { UserLink } from "@/pages/Links";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, StarOff, Trash2, GripVertical, Edit2, Youtube, Video, FileText, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface LinkGroupProps {
  title: string;
  links: UserLink[];
  onUpdate: () => void;
}

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

const getYoutubeVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const SortableLink = ({ link, onUpdate }: { link: UserLink; onUpdate: () => void }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(link.title);
  const [editedUrl, setEditedUrl] = useState(link.url);
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

  const toggleFavorite = async () => {
    const { error } = await supabase
      .from('user_links')
      .update({ is_favorite: !link.is_favorite })
      .eq('id', link.id);

    if (error) {
      toast({
        title: "Error updating link",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    onUpdate();
  };

  const deleteLink = async () => {
    const { error } = await supabase
      .from('user_links')
      .delete()
      .eq('id', link.id);

    if (error) {
      toast({
        title: "Error deleting link",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    onUpdate();
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('user_links')
      .update({ 
        title: editedTitle,
        url: editedUrl 
      })
      .eq('id', link.id);

    if (error) {
      toast({
        title: "Error updating link",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    setIsEditing(false);
    onUpdate();
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
        
        <div className="flex-1 flex items-center gap-2">
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
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            className="h-8 w-8"
          >
            {link.is_favorite ? (
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={deleteLink}
            className="h-8 w-8 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder="URL"
                value={editedUrl}
                onChange={(e) => setEditedUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* YouTube Preview Dialog */}
      {videoId && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>{link.title}</DialogTitle>
            </DialogHeader>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export const LinkGroup = ({ title, links, onUpdate }: LinkGroupProps) => {
  const [items, setItems] = useState(links);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      const updates = newItems.map((item, index) => ({
        id: item.id,
        order_index: index,
      }));

      const { error } = await supabase
        .from('user_links')
        .upsert(updates);

      if (error) {
        toast({
          title: "Error updating order",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      onUpdate();
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(link => link.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((link) => (
              <SortableLink key={link.id} link={link} onUpdate={onUpdate} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};