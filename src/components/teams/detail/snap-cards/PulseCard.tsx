
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface PulseCardProps {
  teamSlug: string;
  onClick: () => void;
}

export const PulseCard = ({ teamSlug, onClick }: PulseCardProps) => {
  return (
    <Card
      className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
      onClick={onClick}
    >
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-blue-500 to-blue-600" />
      <div className="relative p-6 space-y-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
          <MessageSquare className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Pulse</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Für den Herzschlag der Community
          </p>
        </div>
      </div>
    </Card>
  );
};
