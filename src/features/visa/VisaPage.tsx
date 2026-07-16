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

export const VisaPage = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
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
    const { data, count } = await sb.from("visas")
      .select(`id, visa_sl, visa_type, status, issue_date, expiry_date, flight_date, iqamah_number, candidates:candidate_id(id, name, passport_no), agencies:agency(uuid, name)`, { count: "exact" })
      .order("visa_sl", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    setRows(data || []); setTotal(count ?? 0); setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { sb.from("agency").select("uuid, name").then(({ data }) => setAgencies(data || [])); }, []);

  const openAdd = () => { setEditing(null); setForm({ status: "PENDING" }); setCandSearch(""); setModal(true); };
  const openEdit = (r: any) => { setEditing(r); setForm({ ...r, candidate_id: r.candidates?.id, agency: r.agencies?.uuid }); setCandSearch(r.candidates?.name ?? ""); setModal(true); };

  const save = async () => {
    const payload = { candidate_id: form.candidate_id, visa_type: form.visa_type || null, status: form.status, issue_date: form.issue_date || null, expiry_date: form.expiry_date || null, flight_date: form.flight_date || null, iqamah_number: form.iqamah_number || null, agency: form.agency || null, updated_at: new Date().toISOString() };
    if (editing) await sb.from("visas").update(payload).eq("id", editing.id);
    else await sb.from("visas").insert(payload);
    setModal(false); load();
  };

  return (
    <TablePage title="Visa" subtitle="Work visa applications and approvals"
      actions={<button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90"><Plus size={13} /> Add Visa</button>}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["SL", "Candidate", "Passport No", "Type", "Status", "Issue Date", "Expiry", "Flight Date", "Agency", "Actions"].map(h => <Th key={h}>{h}</Th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={10} className="px-5 py-10 text-center text-muted-foreground">Loading...</td></tr>
              : rows.map(r => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <Td mono>{r.visa_sl}</Td>
                <Td><span className="font-medium text-foreground">{r.candidates?.name ?? "—"}</span></Td>
                <Td mono>{r.candidates?.passport_no ?? "—"}</Td>
                <Td><span className="text-muted-foreground">{r.visa_type ?? "—"}</span></Td>
                <Td><StatusBadge status={r.status} /></Td>
                <Td mono>{fmtDate(r.issue_date)}</Td>
                <Td mono>{fmtDate(r.expiry_date)}</Td>
                <Td mono>{fmtDate(r.flight_date)}</Td>
                <Td><span className="text-muted-foreground">{r.agencies?.name ?? "—"}</span></Td>
                <Td>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-yellow-50 text-muted-foreground hover:text-yellow-600"><Edit2 size={13} /></button>
                    <button onClick={async () => { if (confirm("Delete?")) { await sb.from("visas").delete().eq("id", r.id); load(); } }} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Visa" : "Add Visa"}
        footer={<><button onClick={() => setModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">Cancel</button><button onClick={save} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90">Save</button></>}>
        <Field label="Candidate *"><CandidateSearch value={candSearch} onChange={setCandSearch} onSelect={(c: any) => setForm({ ...form, candidate_id: c.id })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Visa Type"><input className={inp} value={form.visa_type ?? ""} onChange={e => setForm({ ...form, visa_type: e.target.value })} /></Field>
          <Field label="Status"><select className={inp} value={form.status ?? "PENDING"} onChange={e => setForm({ ...form, status: e.target.value })}>
            {["PENDING", "APPROVED", "REJECTED", "EXPIRED", "USED"].map(s => <option key={s}>{s}</option>)}
          </select></Field>
          <Field label="Issue Date"><input type="date" className={inp} value={form.issue_date ?? ""} onChange={e => setForm({ ...form, issue_date: e.target.value })} /></Field>
          <Field label="Expiry Date"><input type="date" className={inp} value={form.expiry_date ?? ""} onChange={e => setForm({ ...form, expiry_date: e.target.value })} /></Field>
          <Field label="Flight Date"><input type="date" className={inp} value={form.flight_date ?? ""} onChange={e => setForm({ ...form, flight_date: e.target.value })} /></Field>
          <Field label="Iqamah Number"><input className={inp} value={form.iqamah_number ?? ""} onChange={e => setForm({ ...form, iqamah_number: e.target.value })} /></Field>
          <Field label="Agency"><select className={inp} value={form.agency ?? ""} onChange={e => setForm({ ...form, agency: e.target.value })}>
            <option value="">— Select —</option>
            {agencies.map(a => <option key={a.uuid} value={a.uuid}>{a.name}</option>)}
          </select></Field>
        </div>
      </Modal>
    </TablePage>
  );
};
