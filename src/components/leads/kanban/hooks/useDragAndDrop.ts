
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useState, useRef, CSSProperties } from "react";
import { Tables } from "@/integrations/supabase/types";

interface UseDragAndDropProps {
  id: string;
  lead: Tables<"leads">;
  disabled?: boolean;
  onLeadClick: (id: string) => void;
  forceDragging?: boolean;
}

export const useDragAndDrop = ({ 
  id, 
  lead, 
  disabled = false, 
  onLeadClick,
  forceDragging = false 
}: UseDragAndDropProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragTimeoutRef = useRef<number | null>(null);
  const dragStartTimeRef = useRef<number>(0);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggingDndKit,
  } = useDraggable({
    id,
    data: lead,
    disabled,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    
    dragStartTimeRef.current = Date.now();
    dragTimeoutRef.current = window.setTimeout(() => {
      setIsDragging(true);
    }, 150);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }

    const dragDuration = Date.now() - dragStartTimeRef.current;
    
    if (dragDuration < 200 && !isDragging) {
      onLeadClick(id);
    }
    setIsDragging(false);
  };

  const isCurrentlyDragging = isDragging || isDraggingDndKit || forceDragging;

  const style: CSSProperties = {
    opacity: isCurrentlyDragging ? 0 : 1,
    transform: CSS.Translate.toString(transform || { x: 0, y: 0 }),
    transition: 'opacity 0.2s ease',
    position: 'relative',
    width: '100%',
    cursor: disabled ? 'default' : (isCurrentlyDragging ? 'grabbing' : 'grab'),
    zIndex: isCurrentlyDragging ? 0 : 1,
  };

  return {
    isDragging: isCurrentlyDragging,
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
