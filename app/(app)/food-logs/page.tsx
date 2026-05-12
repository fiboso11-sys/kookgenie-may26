import { ErrorBoundary } from "@/components/error-boundary";
import { CalorieDashboard } from "@/components/tracker/calorie-dashboard";

export default function FoodLogsPage() {
  return (
    <ErrorBoundary title="Calorie tracker could not load">
      <CalorieDashboard />
    </ErrorBoundary>
  );
}
