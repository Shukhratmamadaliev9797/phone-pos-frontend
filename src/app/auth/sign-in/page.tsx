import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Eye, EyeOff, Moon, Sun } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch } from "@/store/hooks";
import { setAuth } from "@/store/slices/auth.slice";
import { login, type LoginRole } from "@/services/auth.service";
import { getStoredTheme, setTheme } from "@/lib/theme";
import type { AxiosError } from "axios";
import { useI18n } from "@/lib/i18n/provider";
import type { LocationState } from "./types";

function toUiErrorMessage(payload: unknown): string | null {
  if (!payload) return null;
  if (typeof payload === "string") return payload;
  if (Array.isArray(payload)) {
    const text = payload.find((item) => typeof item === "string");
    return typeof text === "string" ? text : null;
  }
  if (typeof payload === "object" && payload !== null) {
    const maybe = (payload as { message?: unknown }).message;
    return toUiErrorMessage(maybe);
  }
  return null;
}

export default function SignInPage() {
  const { language, setLanguage, t } = useI18n();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<LoginRole>("ADMIN");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setThemeState] = useState<"light" | "dark" | "system">(() =>
    getStoredTheme(),
  );

  const fromPath = (location.state as LocationState | null)?.from?.pathname;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login(identifier, password, selectedRole);

      localStorage.setItem("access_token", response.access_token);
      if (response.refresh_token) {
        localStorage.setItem("refresh_token", response.refresh_token);
      } else {
        localStorage.removeItem("refresh_token");
      }
      localStorage.setItem("user", JSON.stringify(response.user));

      dispatch(
        setAuth({
          user: response.user,
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
        }),
      );

      navigate(fromPath || "/dashboard", { replace: true });
    } catch (error) {
      const axiosError = error as AxiosError<unknown>;
      const serverMessage = toUiErrorMessage(axiosError.response?.data);
      const message = axiosError.response
        ? (serverMessage ?? t("signin.invalidCredentials"))
        : t("signin.connectionError");
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleThemeToggle(event: React.MouseEvent<HTMLButtonElement>) {
    const next = theme === "dark" ? "light" : "dark";
    const rect = event.currentTarget.getBoundingClientRect();
    setTheme(next, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    setThemeState(next);
  }

  return (
    <div className="page-reveal min-h-screen w-full">
      <div className="relative min-h-screen">
        <div className="absolute inset-0 -z-10">
          <div className="h-full w-full bg-[url('/login-bg.svg')] bg-cover bg-center bg-no-repeat" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/85 to-muted/70 dark:from-background/95 dark:via-background/92 dark:to-background/90" />
        </div>

        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          <Select
            value={language}
            onValueChange={(value) => setLanguage(value as "en" | "uz")}
          >
            <SelectTrigger className="h-10 w-[110px] rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uz">{t("lang.uzbek")}</SelectItem>
              <SelectItem value="en">{t("lang.english")}</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-2xl"
            onClick={(event) => handleThemeToggle(event)}
            aria-label={t("topbar.toggleTheme")}
            title={
              theme === "dark"
                ? t("topbar.switchToLight")
                : t("topbar.switchToDark")
            }
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
          <div className="page-stagger grid w-full items-stretch gap-8">
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="mb-4 text-center">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {t("signin.welcomeBack")}
                  </h1>
                </div>

                <Card className="shadow-sm">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl">
                      {t("signin.title")}
                    </CardTitle>
                    <CardDescription>{t("signin.description")}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                      <div className="space-y-2">
                        <Label htmlFor="identifier">
                          {t("signin.identifier")}
                        </Label>
                        <Input
                          id="identifier"
                          placeholder={t("signin.identifierPlaceholder")}
                          value={identifier}
                          onChange={(event) =>
                            setIdentifier(event.target.value)
                          }
                          disabled={loading}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <Label htmlFor="password">Password</Label>
                          <button
                            type="button"
                            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                          >
                            {t("signin.forgotPassword")}
                          </button>
                        </div>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            disabled={loading}
                            required
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            disabled={loading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>{t("signin.role")}</Label>
                        <Select
                          value={selectedRole}
                          onValueChange={(value) =>
                            setSelectedRole(value as LoginRole)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("signin.selectRole")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">
                              {t("signin.admin")}
                            </SelectItem>
                            <SelectItem value="CASHIER">
                              {t("signin.cashier")}
                            </SelectItem>
                            <SelectItem value="TECHNICIAN">
                              {t("signin.technician")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {error ? (
                        <div
                          role="alert"
                          className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl border border-rose-300/60 bg-rose-500/10 p-3 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-200"
                        >
                          <div className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <div className="space-y-0.5">
                              <p className="text-sm font-semibold">
                                Login failed
                              </p>
                              <p className="text-sm leading-5">{error}</p>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <Button
                        className="w-full"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? t("signin.signingIn") : t("signin.signIn")}
                      </Button>
                    </form>

                    <div className="relative">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                        {t("signin.or")}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col items-start gap-2">
                    <p className="text-xs text-muted-foreground">
                      {t("signin.policy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("signin.needAccount")}{" "}
                      <span className="underline underline-offset-4">
                        {t("signin.contactAdmin")}
                      </span>
                    </p>
                  </CardFooter>
                </Card>

                <div className="mt-6 space-y-2 lg:hidden">
                  <h1 className="text-xl font-semibold">Phone Shop POS</h1>
                  <p className="text-sm text-muted-foreground">
                    {t("signin.footerText")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
