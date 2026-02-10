import { ErrorState } from "@/app/errors/components/error-state";

export default function NotFound() {
  return (
    <ErrorState
      code="404"
      title="Page Not Found"
      description="The page you are trying to open does not exist or has been moved."
      primaryAction={{ label: "Go to Dashboard", to: "/dashboard" }}
      secondaryAction={{ label: "Go to Sign In", to: "/auth/sign-in" }}
    />
  );
}
