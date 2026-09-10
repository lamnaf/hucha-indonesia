"use client";

import * as React from "react";
import { CheckCircle2Icon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export interface FormSuccessProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

function FormSuccess({ title, description, action }: FormSuccessProps) {
  return (
    <Card role="status" className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2Icon className="text-primary size-10" aria-hidden="true" />
        <h3 className="text-lg font-semibold">{title}</h3>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
        {action ? <div className="mt-2">{action}</div> : null}
      </CardContent>
    </Card>
  );
}

export { FormSuccess };
