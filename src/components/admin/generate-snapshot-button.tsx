"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function GenerateSnapshotButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics/aggregate", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        alert("Gagal generate snapshot");
      }
    } catch {
      alert("Gagal generate snapshot");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick} disabled={loading}>
      <RefreshCwIcon
        className={`size-4 ${loading ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      {loading ? "Memproses..." : "Generate Snapshot"}
    </Button>
  );
}
