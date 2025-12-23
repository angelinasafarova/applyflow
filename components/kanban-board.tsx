"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation,
  Active,
  Over,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ApplicationStatus, ApplicationWithVacancy } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NextStepModal } from "@/components/next-step-modal";

interface KanbanColumnProps {
  title: ApplicationStatus;
  applications: ApplicationWithVacancy[];
  id: ApplicationStatus;
}

interface KanbanCardProps {
  application: ApplicationWithVacancy;
}

const KanbanCard = React.memo(({ application }: KanbanCardProps) => {
  return (
    <Card className="mb-3 p-4 bg-white shadow rounded-lg border border-gray-200">
      <CardTitle className="text-md font-semibold mb-1">
        {application.vacancies.role_title}
      </CardTitle>
      <p className="text-sm text-gray-600 mb-2">
        {application.vacancies.company_name}
      </p>
      <p className="text-xs text-gray-500">
        Next Step: {application.next_step || "N/A"}
      </p>
    </Card>
  );
});

KanbanCard.displayName = "KanbanCard";

function KanbanColumn({
  id,
  title,
  applications,
}: KanbanColumnProps) {
  const { setNodeRef, transition, transform } = useSortable({
    id,
    data: { type: "Column", applications: applications },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col w-72 flex-shrink-0 bg-gray-100 rounded-lg p-3 mr-4 shadow-md"
    >
      <h2 className="text-lg font-semibold mb-4 capitalize">{title.replace("_", " ")}</h2>
      <div className="flex flex-col flex-grow overflow-y-auto ">
        <SortableContext
          items={applications.map((app) => app.id)}
          strategy={verticalListSortingStrategy} // Use vertical sorting for cards within a column
        >
          {applications.map((app) => (
            <SortableKanbanCard key={app.id} application={app} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

// Sortable Kanban Card Component
interface SortableKanbanCardProps {
  application: ApplicationWithVacancy;
}

function SortableKanbanCard({ application }: SortableKanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: application.id,
    data: { type: "Application", application: application },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard application={application} />
    </div>
  );
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: { opacity: "0.4" },
    },
  }),
};

export function KanbanBoard({
  applications: initialApplications,
  statuses,
}: {
  applications: ApplicationWithVacancy[];
  statuses: ApplicationStatus[];
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showNextStepModal, setShowNextStepModal] = useState(false);
  const [currentApplicationToUpdate, setCurrentApplicationToUpdate] = useState<ApplicationWithVacancy | null>(null);
  const [newStatusForModal, setNewStatusForModal] = useState<ApplicationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Re-organize applications by status whenever initialApplications changes
    const newApplicationsByStatus = statuses.reduce((acc, status) => {
      acc[status] = initialApplications.filter(app => app.status === status);
      return acc;
    }, {} as Record<ApplicationStatus, ApplicationWithVacancy[]>);
    setApplications(initialApplications);
  }, [initialApplications, statuses]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const findColumn = (id: string) => {
    if (id in applicationsByStatus) {
      return applicationsByStatus[id];
    }

    const application = applications.find((app) => app.id === id);
    if (application) {
      return applicationsByStatus[application.status];
    }
    return undefined;
  };

  const getApplicationColumnId = (applicationId: string) => {
    const app = applications.find(a => a.id === applicationId);
    return app ? app.status : null;
  }

  const handleDragStart = useCallback((event: { active: Active }) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(async (event: { active: Active; over: Over | null }) => {
    const { active, over } = event;

    if (!over) return;

    const activeApplicationId = active.id as string;
    const newColumnId = over.id as ApplicationStatus;

    const currentApplication = applications.find(app => app.id === activeApplicationId);
    if (!currentApplication || currentApplication.status === newColumnId) {
      setActiveId(null);
      return; // No change in column or application not found
    }

    // Check if the new status requires a next step
    const requiresNextStep = !["offer", "rejected", "saved"].includes(newColumnId);

    if (requiresNextStep) {
      setCurrentApplicationToUpdate(currentApplication);
      setNewStatusForModal(newColumnId);
      setShowNextStepModal(true);
      // Optimistically update the UI to allow drag-and-drop to visually complete
      // Actual DB update and router refresh will happen after modal submission
      setApplications((prev) =>
        prev.map((app) =>
          app.id === activeApplicationId ? { ...app, status: newColumnId } : app
        )
      );
    } else {
      // For 'offer' or 'rejected' statuses, update directly
      // Optimistically update UI
      setApplications((prev) =>
        prev.map((app) =>
          app.id === activeApplicationId ? { ...app, status: newColumnId } : app
        )
      );

      const { error } = await supabase
        .from("applications")
        .update({ status: newColumnId, last_status_change_at: new Date().toISOString(), next_step: "", next_step_due_date: null })
        .eq("id", activeApplicationId);

      if (error) {
        console.error("Error updating application status:", error);
        setApplications(initialApplications); // Revert optimistic update
      } else {
        router.refresh();
      }
      setActiveId(null);
    }
  }, [applications, supabase, router, initialApplications]);

  const handleNextStepSubmit = async (nextStep: string, nextStepDueDate: string | null) => {
    if (!currentApplicationToUpdate || !newStatusForModal) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("applications")
        .update({
          status: newStatusForModal,
          last_status_change_at: new Date().toISOString(),
          next_step: nextStep,
          next_step_due_date: nextStepDueDate,
        })
        .eq("id", currentApplicationToUpdate.id);

      if (error) throw error;
      router.refresh();
    } catch (err: any) {
      console.error("Error updating next step:", err);
      setError(err.message);
      // Revert optimistic UI update if next step submission fails
      setApplications(initialApplications);
    } finally {
      setShowNextStepModal(false);
      setCurrentApplicationToUpdate(null);
      setNewStatusForModal(null);
      setIsLoading(false);
      setActiveId(null);
    }
  };

  const applicationsByStatus = statuses.reduce((acc, status) => {
    acc[status] = applications.filter((app) => app.status === status);
    return acc;
  }, {} as Record<ApplicationStatus, ApplicationWithVacancy[]>);

  const activeApplication = activeId ? applications.find(app => app.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex overflow-x-auto gap-4 p-4">
        <SortableContext items={statuses} strategy={horizontalListSortingStrategy}>
          {statuses.map((status) => (
            <KanbanColumn
              key={status}
              id={status}
              title={status}
              applications={applicationsByStatus[status]}
            />
          ))}
        </SortableContext>
      </div>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeApplication ? <KanbanCard application={activeApplication} /> : null}
      </DragOverlay>

      {showNextStepModal && currentApplicationToUpdate && newStatusForModal && (
        <NextStepModal
          application={currentApplicationToUpdate}
          newStatus={newStatusForModal}
          onClose={() => {
            setShowNextStepModal(false);
            // Revert optimistic update if modal is closed without saving
            setApplications(initialApplications);
            setActiveId(null);
          }}
          onSubmit={handleNextStepSubmit}
          isLoading={isLoading}
          error={error}
        />
      )}
    </DndContext>
  );
}

// verticalListSortingStrategy is not directly exported, need to import it explicitly from sortable
import { verticalListSortingStrategy } from "@dnd-kit/sortable";

