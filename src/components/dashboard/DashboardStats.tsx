import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, Target, Award, Phone, Calendar } from "lucide-react";

interface DashboardStatsProps {
  data: {
    totalLeads: number;
    activeLeads: number;
    conversions: number;
    teamSize: number;
    monthlyGrowth: number;
  };
}

export function DashboardStats({ data }: DashboardStatsProps) {
  const stats = [
    {
      label: "Gesamt Leads",
      value: data.totalLeads,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      label: "Aktive Leads", 
      value: data.activeLeads,
      icon: Target,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      label: "Conversions",
      value: data.conversions,
      icon: Award,
      color: "from-purple-500 to-purple-600", 
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      label: "Team Größe",
      value: data.teamSize,
      icon: Users,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50", 
      iconColor: "text-orange-600"
    },
    {
      label: "Monatlich +",
      value: `${data.monthlyGrowth}%`,
      icon: TrendingUp,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600"
    },
    {
      label: "Termine heute",
      value: "3",
      icon: Calendar,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
          <CardContent className="px-4 py-4">
            <div className={`${stat.bgColor} rounded-full w-12 h-12 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}