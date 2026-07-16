import { useState } from "react";
import type { Page } from "../../types";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DashboardPage } from "../../features/dashboard/DashboardPage";
import { CandidatePage } from "../../features/candidates/CandidatePage";
import { MedicalPage } from "../../features/medical/MedicalPage";
import { MofaPage } from "../../features/mofa/MofaPage";
import { VisaPage } from "../../features/visa/VisaPage";
import { TakamulPage } from "../../features/takamul/TakamulPage";
import { PassportPage } from "../../features/passport/PassportPage";
import { SettingPage } from "../../features/settings/SettingPage";

const PAGE_COMPONENTS: Record<Page, () => JSX.Element> = {
  dashboard: DashboardPage,
  candidate: CandidatePage,
  medical: MedicalPage,
  mofa: MofaPage,
  visa: VisaPage,
  takamul: TakamulPage,
  passport: PassportPage,
  setting: SettingPage,
};

export function AppShell() {
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const CurrentPage = PAGE_COMPONENTS[page];

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <Sidebar page={page} onNavigate={setPage} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header page={page} onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-5 lg:p-6"><CurrentPage /></main>
      </div>
    </div>
  );
}
