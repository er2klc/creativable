import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShortcutDialog } from "./ShortcutDialog";
import { useShortcuts } from "@/hooks/use-shortcuts";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
  DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableShortcut = ({ shortcut, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: shortcut.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={onClick}
      >
        {shortcut.title}
      </Button>
    </div>
  );
};

export const QuickActions = () => {
  const navigate = useNavigate();
  const { shortcuts, isLoading, addShortcut, deleteShortcut, reorderShortcuts } = useShortcuts();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleShortcutClick = (shortcut) => {
    switch (shortcut.type) {
      case "team":
        navigate(`/teams/${shortcut.target_id}`);
        break;
      case "team_calendar":
        navigate(`/teams/${shortcut.target_id}/calendar`);
        break;
      case "personal_calendar":
        navigate("/calendar");
        break;
      case "create_contact":
        navigate("/leads?action=create");
        break;
      case "learning_platform":
        navigate("/elevate");
        break;
      case "todo_list":
        navigate("/todo");
        break;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = shortcuts.findIndex((item) => item.id === active.id);
    const newIndex = shortcuts.findIndex((item) => item.id === over.id);

    const updatedShortcuts = [...shortcuts];
    const [movedItem] = updatedShortcuts.splice(oldIndex, 1);
    updatedShortcuts.splice(newIndex, 0, movedItem);

    reorderShortcuts.mutate(
      updatedShortcuts.map((shortcut, index) => ({
        ...shortcut,
        order_index: index,
      }))
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (shortcuts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 mb-8 p-8 border rounded-lg">
        <p className="text-muted-foreground">
          No shortcuts added yet. Click 'Add Shortcut' to create your preferred links.
        </p>
        <ShortcutDialog
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Shortcut
            </Button>
          }
          onSubmit={(data) => addShortcut.mutate({ ...data, order_index: shortcuts.length })}
        />
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        {shortcuts.length < 6 && (
          <ShortcutDialog
            trigger={
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Shortcut
              </Button>
            }
            onSubmit={(data) => addShortcut.mutate({ ...data, order_index: shortcuts.length })}
          />
        )}
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={shortcuts} strategy={verticalListSortingStrategy}>
          <div className="flex flex-wrap gap-4">
            {shortcuts.map((shortcut) => (
              <SortableShortcut
                key={shortcut.id}
                shortcut={shortcut}
                onClick={() => handleShortcutClick(shortcut)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};