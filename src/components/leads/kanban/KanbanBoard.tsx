
import { DndContext, DragEndEvent, closestCenter, DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Tables } from "@/integrations/supabase/types";
import { PhaseColumn } from "./PhaseColumn";
import { AddPhaseButton } from "./AddPhaseButton";
import { useState } from "react";
import { SortableLeadItem } from "./SortableLeadItem";

interface KanbanBoardProps {
  phases: Tables<"pipeline_phases">[];
  leads: Tables<"leads">[];
  isEditMode: boolean;
  selectedPipelineId: string | null;
  onLeadClick: (id: string) => void;
  onUpdatePhase: (leadId: string, phaseId: string) => Promise<void>;
  onDeletePhase: (phase: { id: string; name: string }) => void;
  onUpdatePhaseName: (id: string, name: string) => void;
  onMovePhase: (phaseId: string, direction: 'left' | 'right') => void;
}

export const KanbanBoard = ({
  phases,
  leads,
  isEditMode,
  selectedPipelineId,
  onLeadClick,
  onUpdatePhase,
  onDeletePhase,
  onUpdatePhaseName,
  onMovePhase,
}: KanbanBoardProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [initialWidth, setInitialWidth] = useState<number>(0);

  // Optimierte Sensor-Konfiguration für stabileres Drag & Drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // Spaltenbreite beim Start des Drags speichern
    const columnElement = document.querySelector('.phase-column');
    if (columnElement) {
      setInitialWidth(columnElement.getBoundingClientRect().width);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || !active || isEditMode) return;

    const leadId = active.id as string;
    const newPhaseId = over.id as string;
    
    const lead = leads.find(l => l.id === leadId);
    const oldPhase = phases.find(p => p.id === lead?.phase_id)?.name || '';
    const newPhase = phases.find(p => p.id === newPhaseId)?.name || '';

    if (newPhaseId && oldPhase && newPhase) {
      try {
        console.log('Starting phase update:', { leadId, newPhaseId, oldPhase, newPhase });
        await onUpdatePhase(leadId, newPhaseId);
        console.log('Phase update completed successfully');
      } catch (error) {
        console.error('Error updating phase:', error);
      }
    }
  };

  // Aktivierter Lead für Overlay
  const activeLead = leads.find(lead => lead.id === activeId);

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="mt-6 border-t border-gray-200 shadow-sm pt-6">
        <div className="flex-1 overflow-x-auto no-scrollbar relative h-[calc(100vh)]">
          <div 
            className="flex gap-4 px-4 h-full" 
            style={{ minWidth: 'fit-content' }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />

            {phases.map((phase, index) => (
              <div 
                key={phase.id} 
                className="phase-column"
                style={{
                  width: initialWidth || `${100 / phases.length}%`,
                  minWidth: '190px',
                  flexShrink: 0,
                }}
              >
                <PhaseColumn
                  phase={phase}
                  leads={leads.filter((lead) => lead.phase_id === phase.id)}
                  onLeadClick={onLeadClick}
                  isEditMode={isEditMode}
                  onDeletePhase={() => onDeletePhase(phase)}
                  onUpdatePhaseName={(newName) => onUpdatePhaseName(phase.id, newName)}
                  pipelineId={selectedPipelineId}
                  isFirst={index === 0}
                  isLast={index === phases.length - 1}
                  onMovePhase={
                    isEditMode 
                      ? (direction) => onMovePhase(phase.id, direction)
                      : undefined
                  }
                />
              </div>
            ))}

            {isEditMode && (
              <AddPhaseButton pipelineId={selectedPipelineId} />
            )}

            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeId && activeLead ? (
          <div style={{ 
            width: initialWidth ? `${initialWidth - 32}px` : 'auto',
            transform: 'translate3d(0, 0, 0)',
            position: 'relative',
          }}>
            <SortableLeadItem
              lead={activeLead}
              onLeadClick={onLeadClick}
              disabled={false}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
