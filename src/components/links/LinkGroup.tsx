import { UserLink } from "@/pages/Links";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, StarOff, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
import { useState } from "react";

interface LinkGroupProps {
  title: string;
  links: UserLink[];
  onUpdate: () => void;
}

const SortableLink = ({ link, onUpdate }: { link: UserLink; onUpdate: () => void }) => {
  const { toast } = useToast();
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-background rounded-lg group hover:bg-accent"
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center"
      >
        {link.title}
        <ExternalLink className="h-4 w-4 ml-2 inline-block opacity-50" />
      </a>
      
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

      // Update order_index in database
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