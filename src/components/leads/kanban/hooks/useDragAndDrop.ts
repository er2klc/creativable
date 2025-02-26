
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
    
    // Wenn der Klick kürzer als 200ms war und wir nicht ziehen, behandeln wir es als Klick
    if (dragDuration < 200 && !isDragging) {
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
    zIndex: isDragging || forceDragging ? 1000 : 1,
    position: isDragging || forceDragging ? 'relative' : 'relative',
    width: '100%',
    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
    cursor: disabled ? 'default' : (isDragging || forceDragging ? 'grabbing' : 'grab'),
  } : undefined;

  return {
    isDragging: isDragging || forceDragging,
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
