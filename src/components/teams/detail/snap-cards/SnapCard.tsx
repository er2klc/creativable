import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SnapCardProps {
  snap: {
    id: string;
    icon: React.ReactNode;
    label: string;
    description: string;
    gradient: string;
  };
  isManaging?: boolean;
  isAdmin?: boolean;
  onHide?: (id: string) => void;
}

export const SnapCard = ({ snap, isManaging, isAdmin, onHide }: SnapCardProps) => {
  return (
    <Card
      key={snap.id}
      className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group"
    >
      {isAdmin && (
        <Badge 
          variant="secondary" 
          className="absolute top-2 right-2 z-10"
        >
          Admin
        </Badge>
      )}
      {isManaging && onHide && (
        <button
          onClick={() => onHide(snap.id)}
          className="absolute top-2 right-16 z-10 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
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