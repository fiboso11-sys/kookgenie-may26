import { ErrorBoundary } from "@/components/error-boundary";
import { WeightDashboard } from "@/components/weight/weight-dashboard";

export default function WeightPage() {
  return (
    <ErrorBoundary title="Weight tracker could not load">
      <WeightDashboard />
    </ErrorBoundary>
  );
}
