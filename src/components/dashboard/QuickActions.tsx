import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShortcutDialog } from "./ShortcutDialog";
import { useShortcuts } from "@/hooks/use-shortcuts";
import { DragDropContext, Draggable, Droppable } from "@dnd-kit/core";

export const QuickActions = () => {
  const navigate = useNavigate();
  const { shortcuts, isLoading, addShortcut, deleteShortcut, reorderShortcuts } = useShortcuts();

  const handleShortcutClick = (shortcut: any) => {
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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(shortcuts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    reorderShortcuts.mutate(items.map((item, index) => ({
      ...item,
      order_index: index,
    })));
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
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="shortcuts">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-wrap gap-4"
            >
              {shortcuts.map((shortcut, index) => (
                <Draggable
                  key={shortcut.id}
                  draggableId={shortcut.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => handleShortcutClick(shortcut)}
                      >
                        {shortcut.title}
                      </Button>
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
};