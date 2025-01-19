import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { platformsConfig } from "@/config/platforms";
import { Tables } from "@/integrations/supabase/types";
import { LucideIcon } from "lucide-react";

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value: string | null | string[];
  field: string;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
  isSourceField?: boolean;
}

export function InfoRow({ icon: Icon, label, value, field, onUpdate, isSourceField }: InfoRowProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  const handleStartEdit = (field: string, currentValue: string | null | string[]) => {
    setEditingField(field);
    if (Array.isArray(currentValue)) {
      setEditingValue(currentValue.join(", "));
    } else {
      setEditingValue(currentValue || "");
    }
  };

  const handleUpdate = (field: string, value: string) => {
    if (["languages", "interests", "goals", "challenges"].includes(field)) {
      const arrayValue = value.split(",")
        .map(item => item.trim())
        .filter(Boolean);
      
      if (arrayValue.length > 0 || value === "") {
        onUpdate({ [field]: arrayValue.length > 0 ? arrayValue : [] });
      }
    } else {
      onUpdate({ [field]: value });
    }
  };

  const formatArrayField = (value: string[] | null): string => {
    if (!value || !Array.isArray(value)) return "";
    return value.join(", ");
  };

  const isEditing = editingField === field;
  const displayValue = Array.isArray(value) ? formatArrayField(value) : value;

  return (
    <div className="relative group">
      <div className="flex flex-col gap-1.5 py-2 px-3 hover:bg-gray-50/50 rounded transition-colors">
        <span className="text-xs text-gray-500 flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-gray-400" />
          {label}
        </span>
        {isEditing ? (
          isSourceField ? (
            <Select
              value={editingValue}
              onValueChange={(value) => {
                handleUpdate(field, value);
                setEditingField(null);
              }}
            >
              <SelectTrigger className="w-full h-8 text-sm">
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
              onBlur={() => handleUpdate(field, editingValue)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleUpdate(field, editingValue);
                } else if (e.key === "Escape") {
                  setEditingField(null);
                }
              }}
              autoFocus
              className="h-8 text-sm"
            />
          )
        ) : (
          <div 
            onClick={() => handleStartEdit(field, value)}
            className="cursor-pointer min-h-[20px] text-sm py-0.5"
          >
            {displayValue || ""}
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-100/80" />
    </div>
  );
}