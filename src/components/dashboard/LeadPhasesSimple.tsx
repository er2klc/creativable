import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users } from "lucide-react";

export function LeadPhasesSimple() {
  // Simple static data for now to avoid deep type errors
  const phases = [
    { name: "Kontakt erstellt", count: 15, color: "bg-blue-500" },
    { name: "Kontaktaufnahme", count: 8, color: "bg-yellow-500" },
    { name: "Kennenlernen", count: 6, color: "bg-orange-500" },
    { name: "Präsentation", count: 3, color: "bg-purple-500" },
    { name: "Follow-Up", count: 2, color: "bg-green-500" }
  ];

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Lead Pipeline
        </CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {phases.map((phase, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${phase.color}`} />
                <span className="text-sm font-medium">{phase.name}</span>
              </div>
              <span className="text-sm text-muted-foreground font-mono">
                {phase.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}