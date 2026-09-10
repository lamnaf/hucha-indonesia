"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/error-state";

/**
 * Admin error boundary (blueprint §34). Prevents raw stack traces from
 * reaching staff; unexpected action/page failures collapse to a friendly
 * message with a retry and a way back to the dashboard.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] error boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <ErrorState
        code="Terjadi kesalahan"
        title="Ada masalah"
        description="Terjadi kesalahan yang tidak terduga. Coba lagi, atau kembali ke dashboard."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={reset}>Coba Lagi</Button>
            <Button asChild variant="outline">
              <Link href="/admin">Kembali ke Dashboard</Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
