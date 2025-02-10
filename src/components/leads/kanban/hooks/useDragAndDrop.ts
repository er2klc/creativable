
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useState, useRef, CSSProperties } from "react";
import { Tables } from "@/integrations/supabase/types";

interface UseDragAndDropProps {
  id: string;
  lead: Tables<"leads">;
  disabled?: boolean;
  onLeadClick: (id: string) => void;
}

export const useDragAndDrop = ({ id, lead, disabled = false, onLeadClick }: UseDragAndDropProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragTimeoutRef = useRef<number | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id,
    data: lead,
    disabled,
  });

  const handleMouseDown = () => {
    if (disabled) return;
    
    dragTimeoutRef.current = window.setTimeout(() => {
      setIsDragging(true);
    }, 150);
  };

  const handleMouseUp = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }

    if (!isDragging) {
      onLeadClick(id);
    }
    setIsDragging(false);
  };

  const style: CSSProperties | undefined = transform ? {
    transform: CSS.Transform.toString({
      ...transform,
      x: transform.x,
      y: transform.y,
      scaleX: 1.02,
      scaleY: 1.02,
    }),
    zIndex: isDragging ? 1000 : 1,
    position: isDragging ? 'absolute' : 'relative',
    width: '100%',
    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
    cursor: disabled ? 'default' : (isDragging ? 'grabbing' : 'grab'),
  } : undefined;

  return {
    isDragging,
    style,
    dragHandlers: {
      ref: setNodeRef,
      ...attributes,
      ...listeners,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
    }
  };
};

