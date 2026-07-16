import { Menu, Bell } from "lucide-react";
import type { Page } from "../../types";
import { navItems } from "../../constants/navigation";
import { useAuth } from "../../features/auth/AuthContext";

type HeaderProps = {
  page: Page;
  onOpenSidebar: () => void;
};

export const Header = ({ page, onOpenSidebar }: HeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-5 gap-4 flex-shrink-0">
      <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={onOpenSidebar}><Menu size={20} /></button>
      <div>
        <h1 className="text-sm font-semibold text-foreground">{navItems.find(n => n.id === page)?.label}</h1>
        <p className="text-[11px] text-muted-foreground font-mono">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</p>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell size={17} className="text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold cursor-pointer">
          {(user?.email?.[0] ?? "?").toUpperCase()}
        </div>
      </div>
    </header>
  );
};
