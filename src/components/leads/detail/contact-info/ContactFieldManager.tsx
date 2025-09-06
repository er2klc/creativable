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

  return null; // Temporarily disabled as requested
}