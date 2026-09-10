import * as React from "react";
import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface StarRatingProps {
  rating: number;
  max?: number;
  className?: string;
}

function StarRating({ rating, max = 5, className }: StarRatingProps) {
  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="img"
      aria-label={`Rating ${rating} dari ${max}`}
    >
      {Array.from({ length: max }, (_, index) => {
        const filled = index < Math.round(rating);
        return (
          <StarIcon
            key={index}
            className={cn(
              "size-4",
              filled
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40"
            )}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}

export { StarRating };
