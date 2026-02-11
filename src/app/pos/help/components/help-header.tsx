// src/components/pos/help/help-page-header.tsx
import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LifeBuoy } from "lucide-react";
import type { HelpRole } from "./help-data";
import { useAppSelector } from "@/store/hooks";
import { createSupportRequest } from "@/lib/api/support-requests";
import { useI18n } from "@/lib/i18n/provider";

type HelpPageHeaderProps = {
  role: HelpRole;
};

export function HelpPageHeader({ role }: HelpPageHeaderProps) {
  const { language } = useI18n();
  const authUser = useAppSelector((state) => state.auth.user);
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [toast, setToast] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [toastVisible, setToastVisible] = React.useState(false);

  const fullName = authUser?.name ?? "Unknown User";
  const userRole = authUser?.role ?? role;
  const canContactAdmin = userRole !== "ADMIN" && userRole !== "OWNER_ADMIN";

  React.useEffect(() => {
    if (!toast) return;
    setToastVisible(true);
    const hideTimer = window.setTimeout(() => setToastVisible(false), 2200);
    const clearTimer = window.setTimeout(() => setToast(null), 2700);
    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(clearTimer);
    };
  }, [toast]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (trimmed.length < 5) {
      setToast({
        type: "error",
        message:
          language === "uz"
            ? "Xabar kamida 5 ta belgidan iborat bo'lishi kerak."
            : "Message should be at least 5 characters.",
      });
      return;
    }

    try {
      setSubmitting(true);
      await createSupportRequest({ message: trimmed });
      setOpen(false);
      setMessage("");
      setToast({
        type: "success",
        message:
          language === "uz"
            ? "Xabaringiz admin'ga yuborildi."
            : "Your message has been sent to admin.",
      });
    } catch (error) {
      setToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : language === "uz"
              ? "Xabar yuborilmadi."
              : "Failed to send message.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {language === "uz" ? "Yordam va Qo'llab-quvvatlash" : "Help & Support"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {language === "uz"
              ? "Kundalik POS ishlari uchun qo'llanmalar, FAQ va troubleshooting."
              : "Guides, FAQs, and troubleshooting for daily POS operations."}
          </p>
          <div className="mt-2">
            <Badge className="rounded-full">{role}</Badge>
          </div>
        </div>

        {canContactAdmin ? (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => setOpen(true)}
            >
              <LifeBuoy className="mr-2 h-4 w-4" />
              {language === "uz" ? "Admin bilan bog'lanish" : "Contact Admin"}
            </Button>
          </div>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={(next) => !submitting && setOpen(next)}>
        <DialogContent className="max-w-xl rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {language === "uz" ? "Admin bilan bog'lanish" : "Contact Admin"}
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-user-name">{language === "uz" ? "To'liq ism" : "Full name"}</Label>
                <Input id="contact-user-name" value={fullName} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-user-role">{language === "uz" ? "Rol" : "Role"}</Label>
                <Input id="contact-user-role" value={userRole} readOnly />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-message">{language === "uz" ? "Xabar" : "Message"}</Label>
              <Textarea
                id="contact-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={
                  language === "uz"
                    ? "Muammo yoki so'rovingizni yozing..."
                    : "Write your issue or request..."
                }
                rows={6}
                maxLength={2000}
                disabled={submitting}
              />
              <p className="text-xs text-muted-foreground">{message.length}/2000</p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                {language === "uz" ? "Bekor qilish" : "Cancel"}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? language === "uz"
                    ? "Yuborilmoqda..."
                    : "Sending..."
                  : language === "uz"
                    ? "Yuborish"
                    : "Send"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {toast
        ? createPortal(
            <div
              className={`fixed bottom-6 right-6 z-[9999] transition-all duration-300 ${
                toastVisible ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"
              }`}
            >
              <div className="rounded-2xl border border-emerald-500 bg-white px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg dark:bg-background">
                {toast.message}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
