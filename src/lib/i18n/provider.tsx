import * as React from "react";
import { messages, type Language } from "./messages";
import { enToUz, uzToEn } from "./dom-translations";

const STORAGE_KEY = "app_language";

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

function getInitialLanguage(): Language {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === "uz" || raw === "en") return raw;
  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>(() => getInitialLanguage());

  const setLanguage = React.useCallback((next: Language) => {
    setLanguageState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = React.useCallback(
    (key: string) => messages[language][key] ?? messages.en[key] ?? key,
    [language],
  );

  const value = React.useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t],
  );

  React.useEffect(() => {
    const attributes = ["placeholder", "title", "aria-label"] as const;
    let rafId: number | null = null;

    const translateText = (input: string): string => {
      if (!input) return input;
      if (language === "uz") return enToUz[input] ?? input;
      return uzToEn[input] ?? input;
    };

    const apply = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const textNode = node as Text;
        const raw = textNode.nodeValue ?? "";
        const trimmed = raw.trim();
        if (trimmed) {
          const translated = translateText(trimmed);
          if (translated !== trimmed) {
            textNode.nodeValue = raw.replace(trimmed, translated);
          }
        }
        node = walker.nextNode();
      }

      const elements = document.querySelectorAll<HTMLElement>(
        "[placeholder],[title],[aria-label]",
      );
      elements.forEach((element) => {
        attributes.forEach((attribute) => {
          const value = element.getAttribute(attribute);
          if (!value) return;
          const translated = translateText(value);
          if (translated !== value) {
            element.setAttribute(attribute, translated);
          }
        });
      });
    };

    const schedule = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      rafId = window.requestAnimationFrame(apply);
    };

    schedule();
    const observer = new MutationObserver(() => schedule());
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...attributes],
    });

    return () => {
      observer.disconnect();
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
