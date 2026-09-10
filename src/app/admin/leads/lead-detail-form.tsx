"use client";

import * as React from "react";
import { useActionState } from "react";
import { Select } from "radix-ui";

import { updateLeadAction } from "@/domain/leads/actions";
import { EMPTY_FORM_STATE } from "@/domain/action-state";
import { Field, SubmitButton } from "@/components/admin/form-fields";
import { FormStatus } from "@/components/admin/form-status";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_STATUS_LABELS } from "@/lib/admin";
import type { LeadStatus } from "@/infrastructure/database/generated/client";

export interface LeadDetailFormProps {
  leadId: number;
  status: LeadStatus;
  assignedToId: number | null;
  staff: { id: number; name: string }[];
}

const STATUS_OPTIONS: LeadStatus[] = [
  "new",
  "contacted",
  "converted",
  "rejected",
];

export function LeadDetailForm({
  leadId,
  status,
  assignedToId,
  staff,
}: LeadDetailFormProps) {
  const [nextStatus, setNextStatus] = React.useState<LeadStatus>(status);
  const [nextAssignee, setNextAssignee] = React.useState<string>(
    assignedToId ? String(assignedToId) : ""
  );

  const [state, formAction, pending] = useActionState(
    React.useCallback(
      async (prev: typeof EMPTY_FORM_STATE, formData: FormData) =>
        updateLeadAction(leadId, prev, formData),
      [leadId]
    ),
    EMPTY_FORM_STATE
  );

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status" htmlFor="lead-status" required>
          <Select.Root
            name="status"
            value={nextStatus}
            onValueChange={(value) => setNextStatus(value as LeadStatus)}
          >
            <SelectTrigger id="lead-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {LEAD_STATUS_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select.Root>
        </Field>
        <Field label="Ditugaskan ke" htmlFor="lead-assignee">
          <Select.Root
            name="assignedToId"
            value={nextAssignee}
            onValueChange={setNextAssignee}
          >
            <SelectTrigger id="lead-assignee" className="w-full">
              <SelectValue placeholder="Tidak ditugaskan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tidak ditugaskan</SelectItem>
              {staff.map((member) => (
                <SelectItem key={member.id} value={String(member.id)}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select.Root>
        </Field>
      </div>
      <FormStatus state={state} />
      <div className="flex justify-end">
        <SubmitButton pending={pending} pendingText="Menyimpan...">
          Simpan
        </SubmitButton>
      </div>
    </form>
  );
}
