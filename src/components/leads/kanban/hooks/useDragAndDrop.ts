
import { useDraggable } from "@dnd-kit/core";
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
  const mouseDownTimeRef = useRef<number>(0);
  const clickAllowedRef = useRef(true);

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
    
    mouseDownTimeRef.current = Date.now();
    clickAllowedRef.current = true;
    
    dragTimeoutRef.current = window.setTimeout(() => {
      clickAllowedRef.current = false;
      setIsDragging(true);
    }, 150);
  };

  const handleMouseUp = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }

    const mouseUpTime = Date.now();
    const clickDuration = mouseUpTime - mouseDownTimeRef.current;

    // Wenn der Klick kürzer als 150ms war und wir noch im Click-Modus sind,
    // behandeln wir es als normalen Klick
    if (clickDuration < 150 && clickAllowedRef.current && !isDragging) {
      onLeadClick(id);
    }

    setIsDragging(false);
    clickAllowedRef.current = true;
  };

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
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
    }
  };
};
