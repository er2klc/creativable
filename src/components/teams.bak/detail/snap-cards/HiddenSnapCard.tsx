import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HiddenSnapCardProps {
  snap: {
    id: string;
    icon: React.ReactNode;
    label: string;
    description: string;
    gradient: string;
  };
  onUnhide: (id: string) => void;
}

export const HiddenSnapCard = ({ snap, onUnhide }: HiddenSnapCardProps) => {
  return (
    <Card
      key={snap.id}
      className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group"
      onClick={() => onUnhide(snap.id)}
    >
      {snap.id === "members" && (
        <Badge 
          variant="secondary" 
          className="absolute top-2 right-2 z-10"
        >
          Admin
        </Badge>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <Plus className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${snap.gradient}`} />
      <div className="relative p-6 space-y-4 opacity-50">
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