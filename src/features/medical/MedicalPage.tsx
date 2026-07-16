import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { sb } from "../../lib/supabase";
import { fmtDate } from "../../utils/format";
import { TablePage, Th, Td } from "../../components/common/Table";
import { Pagination } from "../../components/common/Pagination";
import { Modal } from "../../components/common/Modal";
import { Field, inp } from "../../components/common/Field";
import { StatusBadge } from "../../components/common/StatusBadge";
import { CandidateSearch } from "../candidates/CandidateSearch";

export const MedicalPage = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [candSearch, setCandSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const { data, count } = await sb.from("medicals")
      .select(`id, sl, medical_date, fit_date, status, mofa_update, created_at, candidates:candidate_id(id, name, passport_no, sl)`, { count: "exact" })
      .order("sl", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    setRows(data || []); setTotal(count ?? 0); setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm({ status: "N/A", mofa_update: false }); setCandSearch(""); setModal(true); };
  const openEdit = (r: any) => { setEditing(r); setForm({ ...r, candidate_id: r.candidates?.id }); setCandSearch(r.candidates?.name ?? ""); setModal(true); };

  const save = async () => {
    const payload = { candidate_id: form.candidate_id, medical_date: form.medical_date || null, fit_date: form.fit_date || null, status: form.status, mofa_update: form.mofa_update ?? false, updated_at: new Date().toISOString() };
    if (editing) await sb.from("medicals").update(payload).eq("id", editing.id);
    else await sb.from("medicals").insert(payload);
    setModal(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this medical record?")) return;
    await sb.from("medicals").delete().eq("id", id);
    load();
  };

  return (
    <TablePage title="Medical" subtitle="Track GAMCA medical examination results"
      actions={<button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90"><Plus size={13} /> Add Record</button>}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["SL", "Candidate", "Passport No", "Medical Date", "Fit Date", "Status", "MOFA Update", "Actions"].map(h => <Th key={h}>{h}</Th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">Loading...</td></tr>
              : rows.map(r => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <Td mono>{r.sl}</Td>
                <Td><span className="font-medium text-foreground">{r.candidates?.name ?? "—"}</span></Td>
                <Td mono>{r.candidates?.passport_no ?? "—"}</Td>
                <Td mono>{fmtDate(r.medical_date)}</Td>
                <Td mono>{fmtDate(r.fit_date)}</Td>
                <Td><StatusBadge status={r.status} /></Td>
                <Td><span className={`text-xs font-medium ${r.mofa_update ? "text-green-600" : "text-muted-foreground"}`}>{r.mofa_update ? "✓ Yes" : "No"}</span></Td>
                <Td>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-yellow-50 text-muted-foreground hover:text-yellow-600"><Edit2 size={13} /></button>
                    <button onClick={() => remove(r.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Medical" : "Add Medical"}
        footer={<><button onClick={() => setModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">Cancel</button><button onClick={save} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90">Save</button></>}>
        <Field label="Candidate *"><CandidateSearch value={candSearch} onChange={setCandSearch} onSelect={(c: any) => setForm({ ...form, candidate_id: c.id })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Medical Date"><input type="date" className={inp} value={form.medical_date ?? ""} onChange={e => setForm({ ...form, medical_date: e.target.value })} /></Field>
          <Field label="Fit Date"><input type="date" className={inp} value={form.fit_date ?? ""} onChange={e => setForm({ ...form, fit_date: e.target.value })} /></Field>
          <Field label="Status"><select className={inp} value={form.status ?? "N/A"} onChange={e => setForm({ ...form, status: e.target.value })}>
            {["N/A", "NEW", "FIT", "UNFIT", "USED", "EXPIRED"].map(s => <option key={s}>{s}</option>)}
          </select></Field>
          <Field label="MOFA Update"><select className={inp} value={form.mofa_update ? "true" : "false"} onChange={e => setForm({ ...form, mofa_update: e.target.value === "true" })}>
            <option value="false">No</option><option value="true">Yes</option>
          </select></Field>
        </div>
      </Modal>
    </TablePage>
  );
};
