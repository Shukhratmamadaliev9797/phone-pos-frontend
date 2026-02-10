import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/store/hooks";
import { useI18n } from "@/lib/i18n/provider";

export default function UserProfilePage() {
  const { t } = useI18n();
  const authUser = useAppSelector((state) => state.auth.user);

  const user = {
    name: authUser?.name ?? t("user.unknownUser"),
    email: authUser?.email ?? t("user.notProvided"),
    phone: authUser?.phone ?? t("user.notProvided"),
    role: authUser?.role ?? t("user.unknownRole"),
  };

  const avatarInitials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isAdmin = user.role === "ADMIN" || user.role === "OWNER_ADMIN";
  const roleLabel = (() => {
    if (user.role === "OWNER_ADMIN" || user.role === "ADMIN") return t("signin.admin");
    if (user.role === "CASHIER") return t("signin.cashier");
    if (user.role === "TECHNICIAN") return t("signin.technician");
    return user.role;
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("user.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("user.description")}
        </p>
      </div>

      <Card className="rounded-3xl">
        <CardContent className="p-6 space-y-6">
          {/* Top summary */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback>{avatarInitials || "U"}</AvatarFallback>
              </Avatar>

              <div>
                <div className="text-base font-semibold">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>

                <div className="mt-2 flex gap-2">
                  <Badge className="rounded-full">{roleLabel}</Badge>
                  {!isAdmin && (
                    <Badge className="rounded-full bg-rose-500/15 text-rose-700">
                      {t("user.readOnly")}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Info note */}
            <div className="max-w-sm rounded-3xl border bg-muted/10 p-4 text-sm text-muted-foreground">
              {isAdmin ? (
                <>{t("user.adminNote")}</>
              ) : (
                <>{t("user.readOnlyNote")}</>
              )}
            </div>
          </div>

          <Separator />

          {/* Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border p-4">
              <div className="text-xs text-muted-foreground">{t("user.fullName")}</div>
              <div className="mt-1 font-medium">{user.name}</div>
            </div>

            <div className="rounded-3xl border p-4">
              <div className="text-xs text-muted-foreground">{t("user.role")}</div>
              <div className="mt-1 font-medium">{roleLabel}</div>
            </div>

            <div className="rounded-3xl border p-4">
              <div className="text-xs text-muted-foreground">{t("user.email")}</div>
              <div className="mt-1 font-medium">{user.email}</div>
            </div>

            <div className="rounded-3xl border p-4">
              <div className="text-xs text-muted-foreground">{t("user.phone")}</div>
              <div className="mt-1 font-medium">{user.phone}</div>
            </div>

            <div className="rounded-3xl border p-4 sm:col-span-2">
              <div className="text-xs text-muted-foreground">{t("user.accessNoteTitle")}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {t("user.accessNoteBody")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
