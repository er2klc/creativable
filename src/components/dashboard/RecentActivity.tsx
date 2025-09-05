import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Phone, Mail, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface RecentActivityProps {
  activities: Array<{
    id: string;
    title: string;
    completed?: boolean;
    created_at?: string;
    color?: string;
  }>;
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const mockActivities = [
    {
      id: "1",
      type: "call",
      title: "Anruf mit Anna Schmidt",
      time: "vor 2 Stunden",
      status: "completed",
      icon: Phone
    },
    {
      id: "2", 
      type: "email",
      title: "Follow-up E-Mail gesendet",
      time: "vor 4 Stunden",
      status: "completed",
      icon: Mail
    },
    {
      id: "3",
      type: "meeting",
      title: "Team Meeting geplant",
      time: "vor 6 Stunden", 
      status: "scheduled",
      icon: Calendar
    },
    {
      id: "4",
      type: "call",
      title: "Präsentation Max Müller",
      time: "gestern",
      status: "completed",
      icon: Phone
    },
    {
      id: "5",
      type: "email",
      title: "Willkommens-E-Mail",
      time: "vor 2 Tagen",
      status: "completed", 
      icon: Mail
    }
  ];

  const getStatusColor = (status: string) => {
    if (status === "completed") return "bg-green-50 text-green-700 border-green-200";
    if (status === "scheduled") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getStatusText = (status: string) => {
    if (status === "completed") return "Erledigt";
    if (status === "scheduled") return "Geplant";
    return "Offen";
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-2">
            <Clock className="h-5 w-5 text-white" />
          </div>
          Letzte Aktivitäten
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockActivities.map((activity, index) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <div className="bg-white rounded-full p-2 shadow-sm">
              <activity.icon className="h-4 w-4 text-gray-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {activity.title}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {activity.time}
              </p>
            </div>
            
            <Badge 
              variant="outline" 
              className={`text-xs ${getStatusColor(activity.status)}`}
            >
              {getStatusText(activity.status)}
            </Badge>
          </div>
        ))}
        
        <div className="pt-3 border-t border-gray-200">
          <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
            Alle Aktivitäten anzeigen →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}