type StatCardProps = {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  sub?: string;
};

export const StatCard = ({ label, value, icon: Icon, color, sub }: StatCardProps) => (
  <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
  </div>
);
