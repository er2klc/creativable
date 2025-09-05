import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface LeadPipelineChartProps {
  data: Array<{
    phase: string;
    count: number;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function LeadPipelineChart({ data }: LeadPipelineChartProps) {
  const totalLeads = data.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-2">
            <Users className="h-5 w-5 text-white" />
          </div>
          Lead Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = totalLeads > 0 ? (item.count / totalLeads) * 100 : 0;
            const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{item.phase}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{item.count}</span>
                    <span className="text-xs text-gray-500">({percentage.toFixed(0)}%)</span>
                  </div>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${barWidth}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="text-center bg-gray-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
            <p className="text-sm text-gray-600">Gesamt Leads</p>
          </div>
          <div className="text-center bg-green-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-green-600">
              {data.find(d => d.phase === 'Follow-Up')?.count || 0}
            </p>
            <p className="text-sm text-gray-600">In Follow-Up</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}