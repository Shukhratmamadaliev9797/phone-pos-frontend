import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ErrorStateProps = {
  code: string;
  title: string;
  description: string;
  primaryAction: {
    label: string;
    to: string;
  };
  secondaryAction?: {
    label: string;
    to: string;
  };
};

export function ErrorState({
  code,
  title,
  description,
  primaryAction,
  secondaryAction,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-xl rounded-3xl border-muted/50 shadow-sm">
        <CardContent className="space-y-6 p-8 text-center">
          <div className="space-y-2">
            <p className="text-sm font-semibold tracking-[0.2em] text-emerald-600">{code}</p>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="rounded-xl">
              <Link to={primaryAction.to}>{primaryAction.label}</Link>
            </Button>
            {secondaryAction ? (
              <Button asChild variant="outline" className="rounded-xl">
                <Link to={secondaryAction.to}>{secondaryAction.label}</Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
