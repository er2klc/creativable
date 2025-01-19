import { useState } from "react";
import { useContactFields } from "@/hooks/use-contact-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/hooks/use-settings";
import { GripVertical, Settings } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableFieldProps {
  field: {
    id: string;
    field_name: string;
  };
  isReordering: boolean;
}

const SortableField = ({ field, isReordering }: SortableFieldProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 rounded-lg ${
        isReordering ? "bg-gray-50" : ""
      }`}
    >
      {isReordering && (
        <div {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
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
  );
};

export function ContactFieldManager() {
  const { fields, updateFieldOrder } = useContactFields();
  const { settings } = useSettings();
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      const newFields = arrayMove(fields, oldIndex, newIndex);
      updateFieldOrder.mutate(newFields);
    }
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map(field => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {fields.map((field) => (
              <SortableField
                key={field.id}
                field={field}
                isReordering={isReordering}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}