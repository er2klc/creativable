import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusBadgeProps {
  status: string;
  version: string;
  title: string;
  isAdmin: boolean;
  onStatusChange: (version: string, title: string, newStatus: string) => Promise<void>;
}

export function StatusBadge({ status, version, title, isAdmin, onStatusChange }: StatusBadgeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await onStatusChange(version, title, newStatus);
      setCurrentStatus(newStatus);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓ Fertig';
      case 'in-progress':
        return '⚡ In Arbeit';
      case 'planned':
        return '📅 Geplant';
      default:
        return status;
    }
  };

  const getStatusClasses = (status: string) => {
    return `text-xs px-2 py-1 rounded-full cursor-${isAdmin ? 'pointer' : 'default'} ${
      status === 'completed'
        ? 'bg-green-100 text-green-800'
        : status === 'in-progress'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-orange-100 text-orange-800'
    }`;
  };

  if (isAdmin && isEditing) {
    return (
      <Select
        defaultValue={currentStatus}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="completed">✓ Fertig</SelectItem>
          <SelectItem value="in-progress">⚡ In Arbeit</SelectItem>
          <SelectItem value="planned">📅 Geplant</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <span
      onClick={() => isAdmin && setIsEditing(true)}
      className={getStatusClasses(currentStatus)}
    >
      {getStatusDisplay(currentStatus)}
    </span>
  );
}