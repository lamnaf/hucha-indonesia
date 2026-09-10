import { LoadingScreen } from "@/components/loading-screen";

/**
 * Root-level loading boundary (blueprint §34). Shown globally while the
 * current route segment streams or is being fetched during navigation.
 */
export default function RootLoading() {
  return <LoadingScreen />;
}
