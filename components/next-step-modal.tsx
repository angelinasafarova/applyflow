"use client";

import React, { useState } from "react";
import { ApplicationWithVacancy, ApplicationStatus } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface NextStepModalProps {
  application: ApplicationWithVacancy;
  newStatus: ApplicationStatus;
  onClose: () => void;
  onSubmit: (nextStep: string, nextStepDueDate: string | null) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function NextStepModal({
  application,
  newStatus,
  onClose,
  onSubmit,
  isLoading,
  error,
}: NextStepModalProps) {
  const [nextStep, setNextStep] = useState(application.next_step || "");
  const [nextStepDueDate, setNextStepDueDate] = useState<string>(
    application.next_step_due_date || ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nextStep.trim() === "") {
      // Optionally show an inline error here instead of relying on prop error
      return;
    }
    await onSubmit(nextStep, nextStepDueDate === "" ? null : nextStepDueDate);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Next Step for {application.vacancies.role_title}</DialogTitle>
          <DialogDescription>
            Status changing to <span className="font-semibold capitalize">{newStatus.replace("_", " ")}</span>. Please define the next action.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nextStep" className="text-right">
              Next Step
            </Label>
            <Textarea
              id="nextStep"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nextStepDueDate" className="text-right">
              Due Date (Optional)
            </Label>
            <Input
              id="nextStepDueDate"
              type="date"
              value={nextStepDueDate}
              onChange={(e) => setNextStepDueDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          {error && <p className="text-sm text-red-500 col-span-4 text-center">{error}</p>}
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Next Step"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

