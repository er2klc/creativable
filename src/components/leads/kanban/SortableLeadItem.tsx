import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Tables } from "@/integrations/supabase/types";
import { useState, useRef, CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Instagram, Linkedin, Facebook, Video, Users } from "lucide-react";

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

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case "instagram":
        return <Instagram className="h-4 w-4 text-gray-500" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4 text-gray-500" />;
      case "facebook":
        return <Facebook className="h-4 w-4 text-gray-500" />;
      case "tiktok":
        return <Video className="h-4 w-4 text-gray-500" />;
      case "offline":
        return <Users className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
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
    cursor: isDragging ? 'grabbing' : 'grab',
  } : undefined;

  const handleMouseDown = () => {
    dragTimeoutRef.current = window.setTimeout(() => {
      setIsDragging(true);
    }, 150);
  };

  const handleMouseUp = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }

    if (!isDragging) {
      onLeadClick(lead.id);
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
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-3 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200",
        getBackgroundStyle(),
        isDragging && "shadow-lg ring-1 ring-primary/10 cursor-grabbing",
        !isDragging && "cursor-grab"
      )}
      {...attributes}
      {...listeners}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="space-y-1.5">
        <div className="font-medium text-sm flex items-center gap-2">
          {getPlatformIcon(lead.platform)}
          <span>{lead.name}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {lead.contact_type || "Nicht festgelegt"}
        </div>
      </div>
    </div>
  );
}