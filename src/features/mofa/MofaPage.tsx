import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { sb } from "../../lib/supabase";
import { fmtDate } from "../../utils/format";
import { TablePage, Th, Td } from "../../components/common/Table";
import { Pagination } from "../../components/common/Pagination";
import { Modal } from "../../components/common/Modal";
import { Field, inp } from "../../components/common/Field";
import { CandidateSearch } from "../candidates/CandidateSearch";

export const MofaPage = () => {
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
    const { data, count } = await sb.from("mofas")
      .select(`id, sl, application_number, trade, aplication_date, med_update, candidates:candidate(id, name, passport_no, sl), agencies:agency(uuid, name)`, { count: "exact" })
      .order("sl", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    setRows(data || []); setTotal(count ?? 0); setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { sb.from("agency").select("uuid, name, rl").then(({ data }) => setAgencies(data || [])); }, []);

  const openAdd = () => { setEditing(null); setForm({ med_update: false }); setCandSearch(""); setModal(true); };
  const openEdit = (r: any) => { setEditing(r); setForm({ ...r, candidate: r.candidates?.id, agency: r.agencies?.uuid }); setCandSearch(r.candidates?.name ?? ""); setModal(true); };

  const save = async () => {
    const payload = { candidate: form.candidate, application_number: form.application_number || null, trade: form.trade || null, aplication_date: form.aplication_date || null, agency: form.agency || null, med_update: form.med_update ?? false, updated_at: new Date().toISOString() };
    if (editing) await sb.from("mofas").update(payload).eq("id", editing.id);
    else await sb.from("mofas").insert(payload);
    setModal(false); load();
  };

  return (
    <TablePage title="MOFA" subtitle="Ministry of Foreign Affairs attestation tracking"
      actions={<button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90"><Plus size={13} /> Add MOFA</button>}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["SL", "Candidate", "Passport No", "App Number", "Trade", "Agency", "Date", "Med Update", "Actions"].map(h => <Th key={h}>{h}</Th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={9} className="px-5 py-10 text-center text-muted-foreground">Loading...</td></tr>
              : rows.map(r => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <Td mono>{r.sl}</Td>
                <Td><span className="font-medium text-foreground">{r.candidates?.name ?? "—"}</span></Td>
                <Td mono>{r.candidates?.passport_no ?? "—"}</Td>
                <Td mono>{r.application_number ?? "—"}</Td>
                <Td><span className="text-muted-foreground">{r.trade ?? "—"}</span></Td>
                <Td><span className="text-muted-foreground">{r.agencies?.name ?? "—"}</span></Td>
                <Td mono>{fmtDate(r.aplication_date)}</Td>
                <Td><span className={`text-xs font-medium ${r.med_update ? "text-green-600" : "text-muted-foreground"}`}>{r.med_update ? "✓ Yes" : "No"}</span></Td>
                <Td>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-yellow-50 text-muted-foreground hover:text-yellow-600"><Edit2 size={13} /></button>
                    <button onClick={async () => { if (confirm("Delete?")) { await sb.from("mofas").delete().eq("id", r.id); load(); } }} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit MOFA" : "Add MOFA"}
        footer={<><button onClick={() => setModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">Cancel</button><button onClick={save} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90">Save</button></>}>
        <Field label="Candidate *"><CandidateSearch value={candSearch} onChange={setCandSearch} onSelect={(c: any) => setForm({ ...form, candidate: c.id })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Application Number"><input className={inp} value={form.application_number ?? ""} onChange={e => setForm({ ...form, application_number: e.target.value })} /></Field>
          <Field label="Trade"><input className={inp} value={form.trade ?? ""} onChange={e => setForm({ ...form, trade: e.target.value })} /></Field>
          <Field label="Application Date"><input type="date" className={inp} value={form.aplication_date ?? ""} onChange={e => setForm({ ...form, aplication_date: e.target.value })} /></Field>
          <Field label="Agency"><select className={inp} value={form.agency ?? ""} onChange={e => setForm({ ...form, agency: e.target.value })}>
            <option value="">— Select —</option>
            {agencies.map(a => <option key={a.uuid} value={a.uuid}>{a.name}</option>)}
          </select></Field>
          <Field label="Med Update"><select className={inp} value={form.med_update ? "true" : "false"} onChange={e => setForm({ ...form, med_update: e.target.value === "true" })}>
            <option value="false">No</option><option value="true">Yes</option>
          </select></Field>
        </div>
      </Modal>
    </TablePage>
  );
};
