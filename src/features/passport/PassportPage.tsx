import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Eye } from "lucide-react";
import { sb } from "../../lib/supabase";
import { fmtDate } from "../../utils/format";
import { Th, Td } from "../../components/common/Table";
import { Pagination } from "../../components/common/Pagination";
import { Modal } from "../../components/common/Modal";
import { Field, inp } from "../../components/common/Field";
import { StatusBadge } from "../../components/common/StatusBadge";

const LOCS = ["OFFICE", "MEDICAL", "MOFA", "EMBASSY", "AGENCY", "CANDIDATE", "POLICE", "TAKAMUL", "COURIER", "OTHER"];
const LOC_ICONS: Record<string, string> = { OFFICE: "🏢", MEDICAL: "🏥", MOFA: "📑", EMBASSY: "🏛️", AGENCY: "🤝", CANDIDATE: "👤", POLICE: "🚔", TAKAMUL: "📋", COURIER: "📦", OTHER: "📌" };

export const PassportPage = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [histModal, setHistModal] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [histTitle, setHistTitle] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ location: "OFFICE" });
  const [candSearch, setCandSearch] = useState("");
  const [filterLoc, setFilterLoc] = useState("");
  const [loading, setLoading] = useState(false);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    // All candidates LEFT JOIN passport_tracking
    const { data: cands } = await sb.from("candidates").select("id, sl, name, passport_no").eq("is_deleted", false).order("sl", { ascending: false });
    const ids = (cands || []).map(c => c.id);
    const { data: tracks } = ids.length ? await sb.from("passport_tracking").select("*").in("candidate_id", ids) : { data: [] };
    const trackMap: Record<string, any> = {};
    (tracks || []).forEach(t => trackMap[t.candidate_id] = t);
    let merged = (cands || []).map(c => ({ ...c, tracking: trackMap[c.id] || null }));
    if (filterLoc === "__none__") merged = merged.filter(r => !r.tracking);
    else if (filterLoc) merged = merged.filter(r => r.tracking?.location === filterLoc);
    setTotal(merged.length);
    setRows(merged.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
    setLoading(false);
  }, [page, filterLoc]);

  useEffect(() => { load(); }, [load]);

  const openMove = (r: any) => {
    setEditing(r);
    setForm({ location: r.tracking?.location ?? "OFFICE", held_by: r.tracking?.held_by ?? "", phone: r.tracking?.phone ?? "", received_date: new Date().toISOString().split("T")[0], expected_return: "", notes: "" });
    setCandSearch(r.name);
    setModal(true);
  };

  const saveMove = async () => {
    const payload = { candidate_id: editing.id, location: form.location, held_by: form.held_by || null, phone: form.phone || null, received_date: form.received_date || null, expected_return: form.expected_return || null, notes: form.notes || null, updated_at: new Date().toISOString() };
    if (editing.tracking) await sb.from("passport_tracking").update(payload).eq("id", editing.tracking.id);
    else await sb.from("passport_tracking").insert(payload);
    await sb.from("passport_movements").insert({ candidate_id: editing.id, from_location: editing.tracking?.location ?? null, to_location: form.location, movement_date: form.received_date, held_by: form.held_by || null, phone: form.phone || null, notes: form.notes || null });
    setModal(false); load();
  };

  const openHistory = async (r: any) => {
    setHistTitle(r.name);
    const { data } = await sb.from("passport_movements").select("*").eq("candidate_id", r.id).order("movement_date", { ascending: false });
    setHistory(data || []);
    setHistModal(true);
  };

  const today = new Date(); today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Passport Tracker</h2>
          <p className="text-sm text-muted-foreground">সব প্রার্থীর পাসপোর্ট physical location</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select className="px-3 py-2 border border-border rounded-lg bg-card text-xs text-foreground" value={filterLoc} onChange={e => { setFilterLoc(e.target.value); setPage(1); }}>
            <option value="">সব</option>
            <option value="__none__">⚠️ Untracked</option>
            {LOCS.map(l => <option key={l} value={l}>{LOC_ICONS[l]} {l}</option>)}
          </select>
        </div>
      </div>

      {/* Location stat pills */}
      <div className="flex gap-2 flex-wrap">
        {LOCS.map(l => (
          <button key={l} onClick={() => { setFilterLoc(filterLoc === l ? "" : l); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filterLoc === l ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"}`}>
            {LOC_ICONS[l]} {l}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["SL", "Candidate", "Passport No", "Location", "Held By", "Phone", "Received", "Expected Return", "Actions"].map(h => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={9} className="px-5 py-10 text-center text-muted-foreground">Loading...</td></tr>
                : rows.map(r => {
                const t = r.tracking;
                let retDisplay: any = "—";
                if (t?.expected_return) {
                  const exp = new Date(t.expected_return); const diff = Math.ceil((exp.getTime() - today.getTime()) / 86400000);
                  retDisplay = diff < 0 ? <span className="text-red-500 font-medium">⚠️ {fmtDate(t.expected_return)}</span>
                    : diff <= 3 ? <span className="text-amber-500 font-medium">⏰ {fmtDate(t.expected_return)}</span>
                    : fmtDate(t.expected_return);
                }
                return (
                  <tr key={r.id} className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${!t ? "bg-amber-50/50" : ""}`}>
                    <Td mono>{r.sl ?? "—"}</Td>
                    <Td><span className="font-medium text-foreground">{r.name}</span></Td>
                    <Td mono>{r.passport_no}</Td>
                    <Td>{t ? <StatusBadge status={t.location} /> : <span className="text-xs text-muted-foreground italic">Not tracked</span>}</Td>
                    <Td><span className="text-muted-foreground">{t?.held_by ?? "—"}</span></Td>
                    <Td mono>{t?.phone ?? "—"}</Td>
                    <Td mono>{t ? fmtDate(t.received_date) : "—"}</Td>
                    <Td>{retDisplay}</Td>
                    <Td>
                      <div className="flex gap-1">
                        <button onClick={() => openMove(r)} className={`p-1.5 rounded text-xs font-medium ${t ? "hover:bg-yellow-50 text-muted-foreground hover:text-yellow-600" : "bg-primary/10 text-primary hover:bg-primary/20"}`}>
                          {t ? <Edit2 size={13} /> : <Plus size={13} />}
                        </button>
                        {t && <button onClick={() => openHistory(r)} className="p-1.5 rounded hover:bg-blue-50 text-muted-foreground hover:text-blue-600"><Eye size={13} /></button>}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>

      {/* Move Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={`${editing?.tracking ? "📍 সরান" : "+ Track"} — ${editing?.name ?? ""}`}
        footer={<><button onClick={() => setModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">Cancel</button><button onClick={saveMove} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90">Save</button></>}>
        <Field label="Location *">
          <div className="grid grid-cols-5 gap-1.5">
            {LOCS.map(l => (
              <button key={l} onClick={() => setForm({ ...form, location: l })}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-center text-xs transition-colors ${form.location === l ? "bg-primary/10 border-primary text-primary font-medium" : "border-border hover:bg-muted text-muted-foreground"}`}>
                <span className="text-lg">{LOC_ICONS[l]}</span>
                <span className="leading-tight">{l}</span>
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="কার কাছে"><input className={inp} value={form.held_by ?? ""} onChange={e => setForm({ ...form, held_by: e.target.value })} /></Field>
          <Field label="ফোন"><input className={inp} value={form.phone ?? ""} onChange={e => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="তারিখ *"><input type="date" className={inp} value={form.received_date ?? ""} onChange={e => setForm({ ...form, received_date: e.target.value })} /></Field>
          <Field label="ফেরত আসবে"><input type="date" className={inp} value={form.expected_return ?? ""} onChange={e => setForm({ ...form, expected_return: e.target.value })} /></Field>
          <div className="col-span-2"><Field label="নোট"><input className={inp} value={form.notes ?? ""} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field></div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal open={histModal} onClose={() => setHistModal(false)} title={`📜 Movement History — ${histTitle}`}>
        {history.length === 0 ? <p className="text-center text-muted-foreground py-6">No movement history</p>
          : <div className="space-y-3">
            {history.map((m) => (
              <div key={m.id} className="flex gap-3">
                <div className="text-xl">{LOC_ICONS[m.to_location] ?? "📌"}</div>
                <div className="flex-1 border-b border-border pb-3">
                  <div className="text-sm font-medium">{m.from_location ? `${LOC_ICONS[m.from_location]} ${m.from_location} → ` : ""}<strong>{LOC_ICONS[m.to_location]} {m.to_location}</strong></div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {m.held_by && `👤 ${m.held_by}  `}{m.phone && `📞 ${m.phone}  `}
                    {m.notes && <><br />💬 {m.notes}</>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">📅 {fmtDate(m.movement_date)}</div>
                </div>
              </div>
            ))}
          </div>}
      </Modal>
    </div>
  );
};
