import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Tables } from "@/integrations/supabase/types";
import { LeadDetailView } from "../LeadDetailView";
import { useState, useRef } from "react";

interface SortableLeadItemProps {
  lead: Tables<"leads">;
  onLeadClick: (id: string) => void;
}

export const SortableLeadItem = ({ lead, onLeadClick }: SortableLeadItemProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragTimeoutRef = useRef<number | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: lead.id,
    data: lead,
  });

  const style = {
    transform: transform
      ? `${CSS.Transform.toString(transform)} translate(-50%, -50%)` // Zentriert auf Mauszeiger
      : undefined,
    width: "200px", // Fixierte Breite
    height: "60px", // Fixierte Höhe
    opacity: isDragging ? 0.8 : 1,
    position: isDragging ? "absolute" : "relative", // Absolut während Drag
    zIndex: isDragging ? 1000 : "auto", // Highlight während Drag
  };

  const handleMouseDown = () => {
    dragTimeoutRef.current = window.setTimeout(() => {
      setIsDragging(true);
    }, 150); // 150ms Verzögerung für Dragging
  };

  const handleMouseUp = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }

    if (!isDragging) {
      onLeadClick(lead.id); // Nur Klick ausführen, wenn nicht Dragging
    }
    setIsDragging(false);
  };

  const getBackgroundStyle = () => {
    const types = lead.contact_type?.split(",") || [];
    const isPartner = types.includes("Partner");
    const isKunde = types.includes("Kunde");

    if (isPartner && isKunde) {
      return "bg-gradient-to-r from-[#E5DEFF]/30 to-[#F2FCE2]/30";
    } else if (isPartner) {
      return "bg-gradient-to-r from-[#E5DEFF]/30 to-[#F1F0FB]/30";
    } else if (isKunde) {
      return "bg-gradient-to-r from-[#F2FCE2]/30 to-[#E8F5D9]/30";
    }
    return "bg-white";
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`
          p-2 rounded-lg border shadow-md hover:opacity-80 transition-shadow space-y-1
          ${getBackgroundStyle()} 
          ${isDragging ? "shadow-xl ring-2 ring-primary scale-105" : ""}
        `}
        {...attributes}
        {...listeners}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <div className="font-medium">{lead.name}</div>
        <div className="text-sm text-gray-500">
          {lead.contact_type || "Nicht festgelegt"}
        </div>
      </div>

      <LeadDetailView
        leadId={isDragging ? null : lead.id}
        onClose={() => setIsDragging(false)}
      />
    </>
  );
};
