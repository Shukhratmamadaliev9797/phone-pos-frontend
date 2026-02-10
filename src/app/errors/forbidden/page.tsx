import { ErrorState } from "@/app/errors/components/error-state";

export default function Forbidden() {
  return (
    <ErrorState
      code="403"
      title="Forbidden"
      description="You do not have enough permission to open this page."
      primaryAction={{ label: "Back to Dashboard", to: "/dashboard" }}
      secondaryAction={{ label: "Open Help", to: "/help" }}
    />
  );
}
