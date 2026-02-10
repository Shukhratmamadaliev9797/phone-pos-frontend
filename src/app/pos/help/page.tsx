// src/app/pos/help/page.tsx

import { HelpAbout } from "./components/help-about";
import { HelpFaq } from "./components/help-faq";
import { HelpGuides } from "./components/help-guides";
import { HelpPageHeader } from "./components/help-header";
import { HelpQuickLinks } from "./components/help-quicklinks";
import { HelpSearch } from "./components/help-search";
import { HelpTroubleshooting } from "./components/help-troubleshooting";
import { HelpRoleTable } from "./components/help-role-table";
import {
  filterGuidesByRoleAndQuery,
  normalizeHelpRole,
} from "./components/help-data";
import * as React from "react";
import { useAppSelector } from "@/store/hooks";
import { useI18n } from "@/lib/i18n/provider";


export default function HelpPage() {
  const { language } = useI18n();
  const role = useAppSelector((state) => state.auth.user?.role);
  const [query, setQuery] = React.useState("");

  const normalizedRole = normalizeHelpRole(role);
  const visibleGuides = React.useMemo(
    () => filterGuidesByRoleAndQuery(normalizedRole, query, language),
    [language, normalizedRole, query],
  );

  return (
    <div className="space-y-6">
      <HelpPageHeader role={normalizedRole} />
      <HelpSearch value={query} onChange={setQuery} />
      <HelpQuickLinks guides={visibleGuides} />
      <HelpRoleTable guides={visibleGuides} />
      <HelpGuides role={normalizedRole} guides={visibleGuides} />
      <HelpFaq />
      <HelpTroubleshooting />
      <HelpAbout />
    </div>
  );
}
