import { Plus, Users, Calendar, CalendarDays, UserPlus, GraduationCap, CheckSquare } from "lucide-react";
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

const getShortcutIcon = (type: string) => {
  switch (type) {
    case "team":
      return <Users className="h-4 w-4" />;
    case "team_calendar":
      return <Calendar className="h-4 w-4" />;
    case "personal_calendar":
      return <CalendarDays className="h-4 w-4" />;
    case "create_contact":
      return <UserPlus className="h-4 w-4" />;
    case "learning_platform":
      return <GraduationCap className="h-4 w-4" />;
    case "todo_list":
      return <CheckSquare className="h-4 w-4" />;
    default:
      return <Plus className="h-4 w-4" />;
  }
};

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
        {getShortcutIcon(shortcut.type)}
        {shortcut.title}
      </Button>
    </div>
  );
};

const EmptyShortcutButton = ({ onClick }) => (
  <Button
    variant="outline"
    className="flex items-center gap-2"
    onClick={onClick}
  >
    <Plus className="h-4 w-4" />
    Add Shortcut
  </Button>
);

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

  const emptySlots = Math.max(0, 6 - shortcuts.length);
  const emptyButtons = Array(emptySlots).fill(null);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
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
            {emptyButtons.map((_, index) => (
              <ShortcutDialog
                key={`empty-${index}`}
                trigger={<EmptyShortcutButton onClick={() => {}} />}
                onSubmit={(data) => addShortcut.mutate({ ...data, order_index: shortcuts.length })}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {shortcuts.length === 0 && (
        <p className="text-muted-foreground text-center mt-4">
          Click on a button to add a shortcut.
        </p>
      )}
    </div>
  );
};