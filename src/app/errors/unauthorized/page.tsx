import { ErrorState } from "@/app/errors/components/error-state";

export default function Unauthorized() {
  return (
    <ErrorState
      code="401"
      title="Unauthorized"
      description="Your session is missing or expired. Please sign in again to continue."
      primaryAction={{ label: "Go to Sign In", to: "/auth/sign-in" }}
      secondaryAction={{ label: "Back to Dashboard", to: "/dashboard" }}
    />
  );
}
