import { LoadingScreen } from "@/components/loading-screen";

/**
 * Nested loading boundary for the admin area (blueprint §34). Renders inside
 * `admin/layout.tsx`'s shell, so navigating between admin pages keeps the
 * sidebar/header visible while only the content area shows a branded loader,
 * instead of flashing the full-screen root loading state.
 */
export default function AdminLoading() {
  return <LoadingScreen className="min-h-[50vh]" />;
}
