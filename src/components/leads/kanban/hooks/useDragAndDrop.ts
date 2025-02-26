
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
    position: isDragging ? 'fixed' : 'relative',
    top: isDragging ? `${transform.y}px` : 'auto',
    left: isDragging ? `${transform.x}px` : 'auto',
    transform: isDragging ? 'none' : `translate(${transform.x}px, ${transform.y}px)`,
    zIndex: isDragging ? 99999 : 1,
    boxSizing: 'border-box',
    width: isDragging ? '260px' : '100%', // Fixed width during dragging
    pointerEvents: isDragging ? 'none' : 'auto',
    willChange: isDragging ? 'transform' : 'auto',
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
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
    }
  };
};

