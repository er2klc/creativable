
import { Activity } from "lucide-react";
import React from 'react';
import { cn } from "@/lib/utils";

interface TimelineHeaderProps {
  title: string;
  count?: number;
  onFilter?: () => void;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({ title, count, onFilter }) => {
  return (
    <div className={cn("flex items-center justify-between mb-4")}>
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-medium">{title}</h3>
        {count !== undefined && (
          <span className="text-sm text-gray-500">({count})</span>
        )}
      </div>
      {onFilter && (
        <button
          onClick={onFilter}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Filter
        </button>
      )}
    </div>
  );
};

export default TimelineHeader;
