import { useState, useEffect } from "react";
import { Users, Stethoscope, Globe, FileText, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { sb } from "../../lib/supabase";
import { fmtDate } from "../../utils/format";
import { StatCard } from "../../components/common/StatCard";
import { Th, Td } from "../../components/common/Table";

const COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#f97316", "#3b82f6", "#a855f7", "#6b7280"];

export const DashboardPage = () => {
  const [kpis, setKpis] = useState({ candidates: 0, medFit: 0, visaApproved: 0, mofaTotal: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [medChart, setMedChart] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ count: cTotal }, { count: fitCount }, { count: vApproved }, { count: mCount }, { data: recentCands }] = await Promise.all([
        sb.from("candidates").select("id", { count: "exact", head: true }).eq("is_deleted", false),
        sb.from("medicals").select("id", { count: "exact", head: true }).eq("status", "FIT"),
        sb.from("visas").select("id", { count: "exact", head: true }).eq("status", "APPROVED"),
        sb.from("mofas").select("id", { count: "exact", head: true }),
        sb.from("candidates").select("id, sl, name, passport_no, country, created_at").eq("is_deleted", false).order("created_at", { ascending: false }).limit(5),
      ]);
      setKpis({ candidates: cTotal ?? 0, medFit: fitCount ?? 0, visaApproved: vApproved ?? 0, mofaTotal: mCount ?? 0 });
      setRecent(recentCands || []);

      // Medical status chart
      const statuses = ["FIT", "UNFIT", "PENDING", "EXPIRED", "NEW", "USED", "N/A"];
      const counts = await Promise.all(statuses.map(s =>
        sb.from("medicals").select("id", { count: "exact", head: true }).eq("status", s)
      ));
      setMedChart(statuses.map((s, i) => ({ name: s, value: counts[i].count ?? 0 })).filter(x => x.value > 0));
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Candidates" value={kpis.candidates} icon={Users} color="bg-blue-500" />
        <StatCard label="Medical FIT" value={kpis.medFit} icon={Stethoscope} color="bg-green-500" />
        <StatCard label="Visa Approved" value={kpis.visaApproved} icon={Globe} color="bg-indigo-500" />
        <StatCard label="MOFA Records" value={kpis.mofaTotal} icon={FileText} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-1">Medical Status Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">Current breakdown of all medical records</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={medChart} cx="50%" cy="50%" outerRadius={70} paddingAngle={3} dataKey="value">
                {medChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
            {medChart.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="font-mono font-medium text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-1">Quick Links</h3>
          <p className="text-xs text-muted-foreground mb-4">Jump to modules</p>
          <div className="space-y-2">
            {[
              { label: "Add Candidate", icon: Users, page: "candidate" },
              { label: "Medical Records", icon: Stethoscope, page: "medical" },
              { label: "MOFA Applications", icon: FileText, page: "mofa" },
              { label: "Visa Status", icon: Globe, page: "visa" },
              { label: "Takamul / Skill Test", icon: CheckCircle, page: "takamul" },
              { label: "Passport Tracker", icon: AlertCircle, page: "passport" },
            ].map(({ label, icon: Icon, page }) => (
              <button key={page} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/40 transition-colors text-sm text-left">
                <Icon size={15} className="text-primary" />
                <span className="text-foreground">{label}</span>
                <ChevronRight size={13} className="ml-auto text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">সাম্প্রতিক Candidates</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["SL", "Name", "Passport No", "Country", "Date Added"].map(h => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {recent.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <Td mono>{c.sl ?? "—"}</Td>
                  <Td><span className="font-medium text-foreground">{c.name}</span></Td>
                  <Td mono>{c.passport_no}</Td>
                  <Td><span className="text-muted-foreground">{c.country ?? "—"}</span></Td>
                  <Td mono>{fmtDate(c.created_at)}</Td>
                </tr>
              ))}
              {!recent.length && <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground text-sm">No data found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
