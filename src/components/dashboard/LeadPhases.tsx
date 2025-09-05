import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Clock, AlertCircle } from "lucide-react";

export const LeadPhases = () => {
  // Simplified without complex queries
  const phases = [
    {
      name: "Neue Leads",
      count: 12,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      name: "Kontaktiert",
      count: 8,
      icon: UserCheck,
      color: "bg-yellow-500",
    },
    {
      name: "Terminiert",
      count: 5,
      icon: Clock,
      color: "bg-orange-500",
    },
    {
      name: "Abgeschlossen",
      count: 3,
      icon: AlertCircle,
      color: "bg-green-500",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Lead-Phasen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {phases.map((phase) => (
            <div key={phase.name} className="text-center">
              <div className={`w-12 h-12 rounded-full ${phase.color} flex items-center justify-center mx-auto mb-2`}>
                <phase.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold mb-1">{phase.count}</div>
              <div className="text-sm text-muted-foreground">{phase.name}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};