import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface PaginationNavProps {
  prevHref: string;
  nextHref: string;
  prevDisabled: boolean;
  nextDisabled: boolean;
}

/**
 * Previous/next navigation for server-paginated lists. Disabled edges render
 * as real disabled buttons (not focusable), enabled ones as links (§34).
 */
export function PaginationNav({
  prevHref,
  nextHref,
  prevDisabled,
  nextDisabled,
}: PaginationNavProps) {
  return (
    <div className="flex gap-2">
      {prevDisabled ? (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeftIcon className="size-4" aria-hidden="true" />
          Sebelumnya
        </Button>
      ) : (
        <Button asChild variant="outline" size="sm">
          <Link href={prevHref}>
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
            Sebelumnya
          </Link>
        </Button>
      )}
      {nextDisabled ? (
        <Button variant="outline" size="sm" disabled>
          Berikutnya
          <ChevronRightIcon className="size-4" aria-hidden="true" />
        </Button>
      ) : (
        <Button asChild variant="outline" size="sm">
          <Link href={nextHref}>
            Berikutnya
            <ChevronRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      )}
    </div>
  );
}
