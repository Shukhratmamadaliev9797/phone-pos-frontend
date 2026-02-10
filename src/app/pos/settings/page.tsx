import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getStoredTheme, setTheme, type ThemeMode } from "@/lib/theme";
import { updateUserById } from "@/lib/api/users";
import { setAuth } from "@/store/slices/authSlice";

type CompanySettings = {
  shopName: string;
  address: string;
  autoLogoutMinutes: number;
};

const SETTINGS_KEY = "pos_settings_v1";

const DEFAULT_SETTINGS: CompanySettings = {
  shopName: "Phone Shop POS",
  address: "",
  autoLogoutMinutes: 120,
};

function readStoredSettings(): CompanySettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<CompanySettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      autoLogoutMinutes: Number(parsed.autoLogoutMinutes ?? DEFAULT_SETTINGS.autoLogoutMinutes),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveStoredSettings(settings: CompanySettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

const THEME_OPTIONS: Array<{ value: ThemeMode; label: string; hint: string }> = [
  { value: "light", label: "Light Mode", hint: "Always use light mode" },
  { value: "dark", label: "Dark Mode", hint: "Always use dark mode" },
  { value: "system", label: "System Preferences", hint: "Follow device theme" },
];

function ThemePreview({ mode }: { mode: ThemeMode }) {
  if (mode === "dark") {
    return (
      <div className="h-24 rounded-xl border border-slate-600/50 bg-slate-900 p-2">
        <div className="flex gap-1 pb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-300/80" />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
          <span className="h-1.5 w-1.5 rounded-full bg-rose-300/80" />
        </div>
        <div className="grid h-[68px] grid-cols-[36%_1fr] gap-2">
          <div className="rounded-md bg-slate-800" />
          <div className="space-y-1.5 rounded-md bg-slate-800 p-1.5">
            <div className="h-2 w-1/2 rounded bg-slate-600" />
            <div className="h-2 w-5/6 rounded bg-slate-600" />
            <div className="h-2 w-2/3 rounded bg-slate-600" />
            <div className="h-2 w-4/5 rounded bg-slate-600" />
          </div>
        </div>
      </div>
    );
  }

  if (mode === "system") {
    return (
      <div className="h-24 rounded-xl border bg-background p-0.5">
        <div className="grid h-full grid-cols-2 overflow-hidden rounded-[10px]">
          <div className="bg-slate-50 p-1.5">
            <div className="h-full rounded-md border border-slate-200 bg-white p-1">
              <div className="h-2 w-2/3 rounded bg-slate-200" />
              <div className="mt-1 h-2 w-1/2 rounded bg-slate-200" />
            </div>
          </div>
          <div className="bg-slate-900 p-1.5">
            <div className="h-full rounded-md border border-slate-700 bg-slate-800 p-1">
              <div className="h-2 w-2/3 rounded bg-slate-600" />
              <div className="mt-1 h-2 w-1/2 rounded bg-slate-600" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-24 rounded-xl border bg-slate-50 p-2">
      <div className="flex gap-1 pb-2">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400/80" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
      </div>
      <div className="grid h-[68px] grid-cols-[36%_1fr] gap-2">
        <div className="rounded-md border bg-white" />
        <div className="space-y-1.5 rounded-md border bg-white p-1.5">
          <div className="h-2 w-1/2 rounded bg-slate-200" />
          <div className="h-2 w-5/6 rounded bg-slate-200" />
          <div className="h-2 w-2/3 rounded bg-slate-200" />
          <div className="h-2 w-4/5 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);

  const [theme, setThemeState] = React.useState<ThemeMode>(() => getStoredTheme());
  const [settings, setSettings] = React.useState<CompanySettings>(() => readStoredSettings());
  const [savedAt, setSavedAt] = React.useState<Date | null>(null);
  const [adminEmail, setAdminEmail] = React.useState(authUser?.email ?? "");
  const [adminPassword, setAdminPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSavingAdmin, setIsSavingAdmin] = React.useState(false);
  const [adminStatus, setAdminStatus] = React.useState<string | null>(null);
  const [adminError, setAdminError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setAdminEmail(authUser?.email ?? "");
  }, [authUser?.email]);

  const applyTheme = (next: ThemeMode) => {
    setTheme(next);
    setThemeState(next);
  };

  const onSave = () => {
    saveStoredSettings(settings);
    setSavedAt(new Date());
  };

  const onSaveAdminDetails = async () => {
    setAdminError(null);
    setAdminStatus(null);

    const userId = Number(authUser?.id);
    if (!Number.isFinite(userId) || userId <= 0) {
      setAdminError("Current admin user not found");
      return;
    }

    const nextEmail = adminEmail.trim();
    if (!nextEmail) {
      setAdminError("Email is required");
      return;
    }

    if (adminPassword && adminPassword.length < 6) {
      setAdminError("Password must be at least 6 characters");
      return;
    }

    if (adminPassword !== confirmPassword) {
      setAdminError("Password confirmation does not match");
      return;
    }

    const emailChanged = nextEmail !== (authUser?.email ?? "");
    const shouldSendPassword = adminPassword.length > 0;

    if (!emailChanged && !shouldSendPassword) {
      setAdminStatus("No changes to save");
      return;
    }

    setIsSavingAdmin(true);
    try {
      const updated = await updateUserById(userId, {
        email: nextEmail,
        password: shouldSendPassword ? adminPassword : undefined,
      });

      const nextUser = {
        id: updated.id,
        name: updated.fullName || authUser?.name || "Admin",
        role: updated.role,
        email: updated.email ?? undefined,
        phone: updated.phoneNumber ?? undefined,
      };

      localStorage.setItem("user", JSON.stringify(nextUser));
      if (accessToken) {
        dispatch(
          setAuth({
            user: nextUser,
            accessToken,
            refreshToken: refreshToken ?? undefined,
          }),
        );
      }

      setAdminPassword("");
      setConfirmPassword("");
      setAdminStatus("Admin details updated");
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : "Failed to update admin details");
    } finally {
      setIsSavingAdmin(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            System preferences, appearance, and store defaults.
          </p>
        </div>

        <div className="rounded-2xl border bg-card px-4 py-2 text-sm">
          <div className="font-medium">Admin</div>
          <div className="text-muted-foreground">
            {authUser?.name ?? "Current user"}
            {authUser?.email ? ` • ${authUser.email}` : ""}
          </div>
        </div>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose light or dark mode for entire app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3">
            {THEME_OPTIONS.map((option) => {
              const active = theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => applyTheme(option.value)}
                  className={`w-full sm:w-[300px] rounded-2xl border p-2 text-left transition ${
                    active
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "hover:bg-muted/40"
                  }`}
                >
                  <ThemePreview mode={option.value} />
                  <div className="flex items-center gap-2 px-1 pb-1 pt-3">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                        active ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                      }`}
                    >
                      {active ? <Check className="h-2.5 w-2.5" /> : null}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.hint}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Store Profile</CardTitle>
              <CardDescription>
                These values are used as default UI settings on this device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shop-name">Shop name</Label>
                <Input
                  id="shop-name"
                  value={settings.shopName}
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, shopName: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shop-address">Address</Label>
                <Input
                  id="shop-address"
                  value={settings.address}
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, address: event.target.value }))
                  }
                  placeholder="Store location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auto-logout">Auto logout (minutes)</Label>
                <Input
                  id="auto-logout"
                  type="number"
                  min={10}
                  value={settings.autoLogoutMinutes}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      autoLogoutMinutes: Math.max(10, Number(event.target.value || 10)),
                    }))
                  }
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button onClick={onSave}>Save Settings</Button>
                {savedAt ? (
                  <Badge variant="secondary" className="rounded-full">
                    Saved at {savedAt.toLocaleTimeString()}
                  </Badge>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Admin Details</CardTitle>
              <CardDescription>Update current admin login email and password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  placeholder="admin@pos.local"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-password">New password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={adminPassword}
                    onChange={(event) => setAdminPassword(event.target.value)}
                    placeholder="Leave empty to keep current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password-confirm">Confirm password</Label>
                  <Input
                    id="admin-password-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              {adminError ? (
                <p className="text-sm font-medium text-destructive">{adminError}</p>
              ) : null}
              {adminStatus ? (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {adminStatus}
                </p>
              ) : null}

              <div className="pt-1">
                <Button onClick={onSaveAdminDetails} disabled={isSavingAdmin}>
                  {isSavingAdmin ? "Saving..." : "Save Admin Details"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>System</CardTitle>
              <CardDescription>Operational preferences overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Role access: OWNER_ADMIN</p>
              <p>Theme mode: {theme.toUpperCase()}</p>
              <p>Session source: localStorage + Redux persist</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
