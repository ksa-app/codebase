import { Briefcase, X, ChevronRight, LogOut } from "lucide-react";
import type { Page } from "../../types";
import { navItems } from "../../constants/navigation";
import { useAuth } from "../../features/auth/AuthContext";

type SidebarProps = {
  page: Page;
  onNavigate: (page: Page) => void;
  open: boolean;
  onClose: () => void;
};

export const Sidebar = ({ page, onNavigate, open, onClose }: SidebarProps) => {
  const { user, signOut } = useAuth();

  const NavButton = ({ id, label, icon: Icon }: (typeof navItems)[number]) => (
    <button
      key={id}
      onClick={() => { onNavigate(id); onClose(); }}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${page === id ? "bg-primary text-white font-medium" : "text-white/60 hover:text-white hover:bg-white/8"}`}
    >
      <Icon size={15} />{label}
      {page === id && <ChevronRight size={13} className="ml-auto opacity-60" />}
    </button>
  );

  return (
    <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-60 flex flex-col bg-[#0f172a] transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Briefcase size={15} className="text-white" /></div>
        <div><p className="text-sm font-semibold text-white leading-tight">CoreSync ERP</p><p className="text-[10px] text-white/40 font-mono">v1.0.0</p></div>
        <button className="ml-auto lg:hidden text-white/60 hover:text-white" onClick={onClose}><X size={16} /></button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest px-2 pb-2">Main Menu</p>
        {navItems.slice(0, 7).map(item => <NavButton key={item.id} {...item} />)}
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest px-2 pt-4 pb-2">Admin</p>
        {navItems.slice(7).map(item => <NavButton key={item.id} {...item} />)}
      </nav>

      <div className="px-3 pb-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/8 transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
            {(user?.email?.[0] ?? "?").toUpperCase()}
          </div>
          <div className="min-w-0"><p className="text-sm font-medium text-white truncate">{user?.email}</p><p className="text-[10px] text-white/40 truncate">Signed in</p></div>
          <button onClick={signOut} title="Sign out" className="ml-auto text-white/30 hover:text-white/60">
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
};
