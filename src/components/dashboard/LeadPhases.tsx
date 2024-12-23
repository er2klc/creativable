import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, UserPlus, CheckCircle } from "lucide-react";

export const LeadPhases = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Users className="h-5 w-5" />
          Lead-Phasen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Erstkontakt
            </span>
            <span>45%</span>
          </div>
          <Progress value={45} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Follow-up
            </span>
            <span>35%</span>
          </div>
          <Progress value={35} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Abschluss
            </span>
            <span>20%</span>
          </div>
          <Progress value={20} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};