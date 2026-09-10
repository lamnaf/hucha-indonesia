import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface ErrorStateProps {
  code?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  retry?: () => void;
  className?: string;
}

/**
 * Reusable error state. Renders an optional status code, title, description,
 * and either a custom `action` or a `retry` button.
 */
function ErrorState({
  code,
  title,
  description,
  action,
  retry,
  className,
}: ErrorStateProps) {
  return (
    <Card data-slot="error-state" className={className}>
      <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
        {code ? (
          <div className="text-foreground/30 text-6xl font-bold">{code}</div>
        ) : null}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="text-muted-foreground max-w-md text-sm">
              {description}
            </p>
          ) : null}
        </div>
        {(action || retry) && (
          <div className="mt-2">
            {action ?? (
              <Button type="button" onClick={retry}>
                Coba lagi
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { ErrorState };
