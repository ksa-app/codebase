import { Search } from "lucide-react";

type TablePageProps = {
  title: string;
  subtitle?: string;
  actions?: any;
  children?: any;
  onSearch?: (value: string) => void;
};

export const TablePage = ({ title, subtitle, actions, children, onSearch }: TablePageProps) => (
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {onSearch && (
          <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-card text-sm text-muted-foreground w-52">
            <Search size={13} />
            <input placeholder="Search..." className="bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-xs w-full" onChange={e => onSearch(e.target.value)} />
          </div>
        )}
        {actions}
      </div>
    </div>
    <div className="bg-card rounded-xl border border-border overflow-hidden">{children}</div>
  </div>
);

export const Th = ({ children }: { children?: any }) => (
  <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wide whitespace-nowrap">{children}</th>
);

export const Td = ({ children, mono }: { children?: any; mono?: boolean }) => (
  <td className={`px-5 py-3 ${mono ? "font-mono text-xs text-muted-foreground" : "text-sm"}`}>{children}</td>
);
