
import { useState } from "react";
import { useContactFields } from "@/hooks/use-contact-fields";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Eye, EyeOff, GripVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";

export function ContactFieldManager() {
  const [isReordering, setIsReordering] = useState(false);
  const [showEmpty, setShowEmpty] = useState(true);
  const { settings } = useSettings();
  const { fields, addField } = useContactFields();

  console.log("ContactFieldManager rendering with fields:", fields);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {settings?.language === "en" ? "Contact Information" : "Kontaktinformationen"}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEmpty(!showEmpty)}
          >
            {showEmpty ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsReordering(!isReordering)}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => addField()}>
                  <Plus className="h-4 w-4 mr-2" />
                  {settings?.language === "en" ? "Add Field" : "Feld hinzufügen"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-4">
        {fields?.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            {/* Field content would go here */}
            <div className="flex-1">
              <span className="text-sm text-gray-600">{field.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
