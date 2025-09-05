
import { useDraggable } from "@dnd-kit/core";
import { CSSProperties } from "react";
import { Tables } from "@/integrations/supabase/types";

interface UseDragAndDropProps {
  id: string;
  lead: Tables<"leads">;
  disabled?: boolean;
  onLeadClick: (id: string) => void;
}

export const useDragAndDrop = ({ id, lead, disabled = false }: UseDragAndDropProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
    data: lead,
    disabled,
  });

  const style: CSSProperties | undefined = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    boxSizing: 'border-box',
    width: '100%',
    opacity: isDragging ? 0 : 1,
    transition: 'box-shadow 0.2s ease',
    cursor: disabled ? 'default' : (isDragging ? 'grabbing' : 'grab'),
  } : undefined;

  return {
    isDragging,
    style,
    dragHandlers: {
      ref: setNodeRef,
      ...attributes,
      ...listeners,
    }
  };
};
