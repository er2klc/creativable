import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Trash2, Calendar } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { formatDateTime } from "../utils/dateUtils";
import { MeetingTypeIcon } from "./MeetingTypeIcon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/calendar/appointment-dialog/AppointmentForm";
import { useState } from "react";

interface AppointmentCardProps {
  content: string;
  metadata?: {
    dueDate?: string;
    endTime?: string;
    meetingType?: string;
    color?: string;
  };
  isCompleted?: boolean;
  onDelete?: () => void;
}

export const AppointmentCard = ({
  content,
  metadata,
  isCompleted,
  onDelete
}: AppointmentCardProps) => {
  const { settings } = useSettings();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getTimeDisplay = () => {
    if (!metadata?.dueDate) return "";

    const startTime = format(new Date(metadata.dueDate), "HH:mm");
    if (metadata?.endTime) {
      return `${startTime} - ${format(new Date(metadata.endTime), "HH:mm")}`;
    }
    return startTime;
  };

  return (
    <>
      <div className="flex items-start justify-between group">
        <div className="flex items-start gap-2">
          {metadata?.meetingType && (
            <div className="mt-1">
              <MeetingTypeIcon type={metadata.meetingType} className="h-4 w-4" />
            </div>
          )}
          <div>
            <div 
              className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
              onClick={() => setIsEditDialogOpen(true)}
            >
              {content}
            </div>
            {metadata?.meetingType && (
              <div className="text-xs text-gray-500">
                {metadata.meetingType}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          {metadata?.dueDate && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-gray-400 mt-1" />
              <div>
                <div className="text-sm text-gray-500">
                  {format(new Date(metadata.dueDate), "dd. MMM yyyy", { 
                    locale: settings?.language === "en" ? undefined : de 
                  })}
                </div>
                <div className="text-sm text-blue-600 font-medium">
                  {getTimeDisplay()}
                </div>
              </div>
            </div>
          )}
          
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
            </Button>
          )}
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <AppointmentForm
            onSubmit={(values) => {
              // Handle appointment update
              setIsEditDialogOpen(false);
            }}
            defaultValues={{
              title: content,
              time: metadata?.dueDate || "",
              endTime: metadata?.endTime,
              meeting_type: metadata?.meetingType || "",
              color: metadata?.color || "#40E0D0",
              leadId: ""
            }}
            isEditing
          />
        </DialogContent>
      </Dialog>
    </>
  );
};