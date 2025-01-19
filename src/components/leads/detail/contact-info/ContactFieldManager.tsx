import { useState } from "react";
import { useContactFields, type ContactFieldSetting } from "@/hooks/use-contact-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/hooks/use-settings";
import { GripVertical, Settings } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@dnd-kit/core";

export function ContactFieldManager() {
  const { fields, updateFieldOrder } = useContactFields();
  const { settings } = useSettings();
  const [isReordering, setIsReordering] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateFieldOrder.mutate(items);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {settings?.language === "en" ? "Contact Fields" : "Kontaktfelder"}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsReordering(!isReordering)}
        >
          <Settings className="h-4 w-4 mr-2" />
          {isReordering
            ? settings?.language === "en"
              ? "Done"
              : "Fertig"
            : settings?.language === "en"
            ? "Reorder Fields"
            : "Felder neu anordnen"}
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="fields">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {fields.map((field, index) => (
                <Draggable
                  key={field.id}
                  draggableId={field.id}
                  index={index}
                  isDragDisabled={!isReordering}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center gap-2 p-2 rounded-lg ${
                        isReordering ? "bg-gray-50" : ""
                      }`}
                    >
                      {isReordering && (
                        <div {...provided.dragHandleProps}>
                          <GripVertical className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          value={field.field_name}
                          readOnly
                          className="bg-transparent border-none"
                        />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}