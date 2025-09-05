import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface NetworkGrowthChartProps {
  data: Array<{
    day: string;
    leads: number;
    calls: number;
  }>;
}

export function NetworkGrowthChart({ data }: NetworkGrowthChartProps) {
  const maxValue = Math.max(...data.map(d => Math.max(d.leads, d.calls)));

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-2">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            Wöchentliche Aktivität
          </CardTitle>
          <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded-lg">
            +12% diese Woche
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.day}</span>
                <span className="text-gray-600">{item.leads} Leads • {item.calls} Anrufe</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(item.leads / maxValue) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(item.calls / maxValue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
            <span>Leads</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
            <span>Anrufe</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}