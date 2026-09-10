import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

export interface LoadingScreenProps {
  label?: string;
  className?: string;
}

/**
 * Full-screen branded loading state shown by `src/app/loading.tsx` while a
 * route segment streams or is being fetched during navigation.
 */
function LoadingScreen({ label, className }: LoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-[100dvh] flex-col items-center justify-center gap-5",
        className
      )}
    >
      <BrandLogo
        className="gap-3"
        markClassName="size-12 rounded-xl"
      />
      <span
        aria-hidden="true"
        className="border-primary/30 border-t-primary size-8 animate-spin rounded-full border-[3px]"
      />
      <p className="text-muted-foreground text-sm">
        {label ?? "Memuat..."}
      </p>
    </div>
  );
}

export { LoadingScreen };
