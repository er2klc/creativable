import { Card } from "@/components/ui/card";
import { X, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SnapCardProps {
  snap: {
    id: string;
    icon: React.ReactNode;
    label: string;
    description: string;
    gradient: string;
    onClick?: () => void;
    component?: React.ComponentType<any>;
  };
  isManaging?: boolean;
  isAdmin?: boolean;
  canHide?: boolean;
  onHide?: (id: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export const SnapCard = ({ 
  snap, 
  isManaging, 
  isAdmin, 
  canHide = true, 
  onHide,
  onBack,
  showBackButton = false
}: SnapCardProps) => {
  if (snap.component) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    if (snap.onClick) {
      e.preventDefault();
      snap.onClick();
    }
  };

  return (
    <Card
      key={snap.id}
      className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group ${
        isManaging ? 'ring-2 ring-primary/20' : ''
      }`}
      onClick={handleClick}
    >
      {showBackButton && onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          className="absolute top-2 left-2 z-10"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Zurück
        </Button>
      )}
      
      {isAdmin && (
        <Badge 
          variant="secondary" 
          className="absolute top-2 right-2 z-10"
        >
          Admin
        </Badge>
      )}
      
      {isManaging && canHide && onHide && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onHide(snap.id);
          }}
          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-background/80 opacity-100 transition-opacity hover:bg-destructive/10"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
      
      <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${snap.gradient}`} />
      <div className="relative p-6 space-y-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg ${snap.gradient}`}>
          <div className="text-white">
            {snap.icon}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg">{snap.label}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {snap.description}
          </p>
        </div>
      </div>
    </Card>
  );
};