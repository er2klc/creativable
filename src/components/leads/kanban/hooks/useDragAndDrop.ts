
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
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);

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
    
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    dragTimeoutRef.current = window.setTimeout(() => {
      setIsDragging(true);
    }, 150);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }

    if (mouseDownPosRef.current) {
      const moveDistance = Math.sqrt(
        Math.pow(e.clientX - mouseDownPosRef.current.x, 2) +
        Math.pow(e.clientY - mouseDownPosRef.current.y, 2)
      );

      // Wenn die Maus sich kaum bewegt hat, behandeln wir es als Klick
      if (moveDistance < 5 && !isDragging) {
        // Wir lassen den tatsächlichen Klick vom onClick-Handler der Karte behandeln
        mouseDownPosRef.current = null;
        return;
      }
    }

    mouseDownPosRef.current = null;
    setIsDragging(false);
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
