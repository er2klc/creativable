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

interface LinkGroupProps {
  title: string;
  links: UserLink[];
  onUpdate: () => void;
}

export const LinkGroup = ({ title, links, onUpdate }: LinkGroupProps) => {
  const [items, setItems] = useState(links);
  const { toast } = useToast();
  const { user } = useAuth();

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
        order_index: index,
        user_id: user.id
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