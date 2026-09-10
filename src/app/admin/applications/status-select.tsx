"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderIcon } from "lucide-react";
import { Select } from "radix-ui";

import { setApplicationStatusAction } from "@/domain/jobs/application-actions";
import { useToast } from "@/components/ui/use-toast";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { applicationStatusLabel } from "@/lib/admin";
import type { ApplicationStatus } from "@/infrastructure/database/generated/client";

const STATUS_OPTIONS: ApplicationStatus[] = [
  "new",
  "reviewed",
  "rejected",
  "hired",
];

export interface ApplicationStatusSelectProps {
  applicationId: number;
  status: ApplicationStatus;
}

export function ApplicationStatusSelect({
  applicationId,
  status,
}: ApplicationStatusSelectProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function change(nextValue: string) {
    const next = nextValue as ApplicationStatus;
    if (next === status) return;
    startTransition(async () => {
      const res = await setApplicationStatusAction(applicationId, next);
      if (res.error) {
        toast({ variant: "destructive", title: res.error });
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select.Root value={status} onValueChange={change} disabled={pending}>
        <SelectTrigger size="sm" className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {applicationStatusLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select.Root>
      {pending ? (
        <LoaderIcon
          className="text-muted-foreground size-4 animate-spin"
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
