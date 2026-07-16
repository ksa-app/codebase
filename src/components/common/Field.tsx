export const inp =
  "w-full px-3 py-2 border border-border rounded-lg bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40";

export const Field = ({ label, children }: { label: string; children?: any }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
    {children}
  </div>
);
