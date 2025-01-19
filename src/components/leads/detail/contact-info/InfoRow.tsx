import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { platformsConfig } from "@/config/platforms";
import { Tables } from "@/integrations/supabase/types";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value: string | null | string[];
  field: string;
  onUpdate: (updates: Partial<Tables<"leads">>, showToast?: boolean) => void;
  isSourceField?: boolean;
  showToast?: boolean;
}

export function InfoRow({ 
  icon: Icon, 
  label, 
  value, 
  field, 
  onUpdate,
  isSourceField,
  showToast = false
}: InfoRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState<string>("");

  const handleStartEdit = (currentValue: string | null | string[]) => {
    setIsEditing(true);
    if (Array.isArray(currentValue)) {
      setEditingValue(currentValue.join(", "));
    } else {
      setEditingValue(currentValue || "");
    }
  };

  const handleUpdate = (value: string) => {
    if (["languages", "interests", "goals", "challenges"].includes(field)) {
      const arrayValue = value.split(",")
        .map(item => item.trim())
        .filter(Boolean);
      
      if (arrayValue.length > 0 || value === "") {
        onUpdate({ [field]: arrayValue.length > 0 ? arrayValue : [] }, showToast);
      }
    } else {
      onUpdate({ [field]: value }, showToast);
    }
    setIsEditing(false);
  };

  const formatArrayField = (value: string[] | null): string => {
    if (!value || !Array.isArray(value)) return "";
    return value.join(", ");
  };

  const displayValue = Array.isArray(value) ? formatArrayField(value) : value;

  return (
    <div className="group relative">
      <div className={cn(
        "flex items-center gap-2 py-3 rounded-lg transition-colors",
        isEditing ? "bg-gray-50" : "hover:bg-gray-50/80"
      )}>
        <div className="flex items-center gap-3 w-1/2 pl-4">
          <Icon className="h-4 w-4 text-gray-500 shrink-0" />
          <div className="text-sm font-medium text-gray-700 truncate">
            {label}
          </div>
        </div>
        
        <div className="flex-1 w-1/2 pr-4">
          {isEditing ? (
            isSourceField ? (
              <Select
                value={editingValue}
                onValueChange={(value) => {
                  handleUpdate(value);
                  setIsEditing(false);
                }}
                onOpenChange={(open) => !open && setIsEditing(false)}
              >
                <SelectTrigger className="w-full h-8 text-sm bg-white">
                  <SelectValue placeholder="Wähle eine Quelle" />
                </SelectTrigger>
                <SelectContent>
                  {platformsConfig.map((platform) => (
                    <SelectItem key={platform.name} value={platform.name}>
                      <div className="flex items-center gap-2">
                        <platform.icon className="h-4 w-4" />
                        {platform.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={() => {
                  handleUpdate(editingValue);
                  setIsEditing(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUpdate(editingValue);
                  } else if (e.key === "Escape") {
                    setIsEditing(false);
                  }
                }}
                autoFocus
                className="h-8 text-sm bg-white"
              />
            )
          ) : (
            <div 
              onClick={() => handleStartEdit(value)}
              className="text-sm py-0.5 min-h-[20px] cursor-pointer text-gray-900 hover:text-gray-700 transition-colors"
            >
              {displayValue || "—"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}