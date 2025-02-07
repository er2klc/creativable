
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MenuHeaderProps {
  onClose: () => void;
}

export function MenuHeader({ onClose }: MenuHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
      <div className="flex items-center gap-2">
        <img 
          src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
          alt="Logo" 
          className="h-8 w-8"
        />
        <span className="text-sm text-white font-light">creativable</span>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onClose}
        className="text-white hover:bg-sidebar-accent"
      >
        <X className="h-6 w-6" />
      </Button>
    </div>
  );
}
