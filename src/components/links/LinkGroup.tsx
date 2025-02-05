import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { UserLink } from "@/pages/Links";
import { SortableLink } from "./components/SortableLink";
import { Card } from "@/components/ui/card";
import { LinkActions } from "./components/LinkActions";
import { LinkEditDialog } from "./components/LinkEditDialog";

interface LinkGroupProps {
  title: string;
  links: UserLink[];
  onUpdate: () => void;
}

export const LinkGroup = ({ title, links, onUpdate }: LinkGroupProps) => {
  const [items, setItems] = useState(links);
  const [editingLink, setEditingLink] = useState<UserLink | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const isPresentationGroup = links.length > 0 && links[0].group_type === 'presentation';

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to manage links",
        variant: "destructive",
      });
      return;
    }

    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      const updates = newItems.map((item, index) => ({
        id: item.id,
        title: item.title,
        url: item.url,
        order_index: index,
        user_id: user.id,
        group_type: item.group_type,
        is_favorite: item.is_favorite
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

  const handleEditSuccess = (updatedLink: UserLink) => {
    // Update the local state with the edited link
    const newItems = items.map(item => 
      item.id === updatedLink.id ? updatedLink : item
    );
    setItems(newItems);
    setEditingLink(null);
  };

  const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (isPresentationGroup) {
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((link) => {
                const videoId = getYoutubeVideoId(link.url);
                if (!videoId) return null;

                return (
                  <Card key={link.id} className="p-4 group relative">
                    <div className="aspect-video mb-2">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={link.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate flex-1">{link.title}</h3>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <LinkActions
                          link={link}
                          onUpdate={onUpdate}
                          onEdit={() => setEditingLink(link)}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        {editingLink && (
          <LinkEditDialog
            link={editingLink}
            isOpen={!!editingLink}
            onOpenChange={(open) => !open && setEditingLink(null)}
            onUpdate={() => {
              onUpdate();
              handleEditSuccess(editingLink);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items
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