import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Tables } from "@/integrations/supabase/types";
import { useState, useRef, CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Instagram, Linkedin, Facebook, Video, Users } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface SortableLeadItemProps {
  lead: Tables<"leads">;
  onLeadClick: (id: string) => void;
  disabled?: boolean;
}

export const SortableLeadItem = ({ lead, onLeadClick, disabled = false }: SortableLeadItemProps) => {
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
    disabled,
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case "instagram":
        return <Instagram className="h-5 w-5 text-white" />;
      case "linkedin":
        return <Linkedin className="h-5 w-5 text-white" />;
      case "facebook":
        return <Facebook className="h-5 w-5 text-white" />;
      case "tiktok":
        return <Video className="h-5 w-5 text-white" />;
      case "offline":
        return <Users className="h-5 w-5 text-white" />;
      default:
        return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case "instagram":
        return "bg-gradient-to-br from-purple-600 to-pink-500";
      case "linkedin":
        return "bg-blue-600";
      case "facebook":
        return "bg-blue-700";
      case "tiktok":
        return "bg-black";
      default:
        return "bg-gray-500";
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
    cursor: disabled ? 'default' : (isDragging ? 'grabbing' : 'grab'),
  } : undefined;

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
      onLeadClick(lead.id);
    }
    setIsDragging(false);
  };

  const getBackgroundStyle = () => {
    const types = lead.contact_type?.split(",") || [];
    const isPartner = types.includes("Likely Partner");
    const isKunde = types.includes("Likely Kunde");

    if (isPartner && isKunde) {
      return "bg-gradient-to-r from-[#F0FAFF] to-[#F0FFF0]";
    } else if (isPartner) {
      return "bg-[#F0FAFF]";
    } else if (isKunde) {
      return "bg-[#F0FFF0]";
    }
    return "bg-white";
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get platform border color
  const getPlatformBorderColor = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case "instagram":
        return "border-l-pink-500";
      case "linkedin":
        return "border-l-blue-600";
      case "facebook":
        return "border-l-blue-700";
      case "tiktok":
        return "border-l-black";
      default:
        return "border-l-gray-500";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-3 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 relative border-l-2",
        getBackgroundStyle(),
        getPlatformBorderColor(lead.platform),
        isDragging && "shadow-lg ring-1 ring-primary/10 cursor-grabbing",
        !isDragging && !disabled && "cursor-grab",
        disabled && "cursor-default"
      )}
      {...(disabled ? {} : { ...attributes, ...listeners })}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Platform Icon in top right corner */}
      <div className={cn(
        "absolute -right-2 -top-2 rounded-full w-8 h-8 border-2 border-white shadow-lg flex items-center justify-center",
        getPlatformColor(lead.platform)
      )}>
        {getPlatformIcon(lead.platform)}
      </div>

      <div className="flex gap-3">
        {/* Profile Picture Column */}
        <div className="flex-shrink-0">
          <div className={cn(
            "h-16 w-16 rounded-md overflow-hidden",
            lead.platform.toLowerCase() === "offline" && "border border-gray-300"
          )}>
            {lead.social_media_profile_image_url ? (
              <img 
                src={lead.social_media_profile_image_url} 
                alt={lead.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gray-100 flex items-center justify-center text-lg font-medium">
                {getInitials(lead.name)}
              </div>
            )}
          </div>
        </div>

        {/* Info Column */}
        <div className="flex flex-col justify-center min-w-0">
          <div className="font-medium text-sm truncate">
            {lead.name}
          </div>
          {lead.social_media_username && (
            <span className="text-xs text-muted-foreground truncate">
              @{lead.social_media_username}
            </span>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            {lead.contact_type || "Nicht festgelegt"}
          </div>
        </div>
      </div>
    </div>
  );
}