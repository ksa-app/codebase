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

export const TakamulPage = () => {
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
    const { data, count } = await sb.from("takamul")
      .select(`id, trade, test_center, test_date, result, result_date, certificate_no, issue_date, expiry_date, status, candidates:candidate_id(id, name, passport_no, sl)`, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    setRows(data || []); setTotal(count ?? 0); setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm({ status: "PENDING", result: "PENDING" }); setCandSearch(""); setModal(true); };
  const openEdit = (r: any) => { setEditing(r); setForm({ ...r, candidate_id: r.candidates?.id }); setCandSearch(r.candidates?.name ?? ""); setModal(true); };

  const save = async () => {
    const payload = { candidate_id: form.candidate_id, trade: form.trade || null, test_center: form.test_center || null, test_date: form.test_date || null, result: form.result, result_date: form.result_date || null, certificate_no: form.certificate_no || null, issue_date: form.issue_date || null, expiry_date: form.expiry_date || null, status: form.status, updated_at: new Date().toISOString() };
    if (editing) await sb.from("takamul").update(payload).eq("id", editing.id);
    else await sb.from("takamul").insert(payload);
    setModal(false); load();
  };

  return (
    <TablePage title="Takamul / Skill Test" subtitle="Trade test and certification tracking"
      actions={<button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90"><Plus size={13} /> Add Takamul</button>}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["Candidate", "Passport No", "Trade", "Test Center", "Test Date", "Result", "Certificate No", "Expiry", "Status", "Actions"].map(h => <Th key={h}>{h}</Th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={10} className="px-5 py-10 text-center text-muted-foreground">Loading...</td></tr>
              : rows.map(r => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <Td><span className="font-medium text-foreground">{r.candidates?.name ?? "—"}</span></Td>
                <Td mono>{r.candidates?.passport_no ?? "—"}</Td>
                <Td><span className="font-medium">{r.trade ?? "—"}</span></Td>
                <Td><span className="text-muted-foreground">{r.test_center ?? "—"}</span></Td>
                <Td mono>{fmtDate(r.test_date)}</Td>
                <Td><StatusBadge status={r.result} /></Td>
                <Td mono>{r.certificate_no ?? "—"}</Td>
                <Td mono>{fmtDate(r.expiry_date)}</Td>
                <Td><StatusBadge status={r.status} /></Td>
                <Td>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-yellow-50 text-muted-foreground hover:text-yellow-600"><Edit2 size={13} /></button>
                    <button onClick={async () => { if (confirm("Delete?")) { await sb.from("takamul").delete().eq("id", r.id); load(); } }} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Takamul" : "Add Takamul"}
        footer={<><button onClick={() => setModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">Cancel</button><button onClick={save} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90">Save</button></>}>
        <Field label="Candidate *"><CandidateSearch value={candSearch} onChange={setCandSearch} onSelect={(c: any) => setForm({ ...form, candidate_id: c.id })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Trade *"><input className={inp} value={form.trade ?? ""} onChange={e => setForm({ ...form, trade: e.target.value })} placeholder="MASON / DRIVER..." /></Field>
          <Field label="Test Center"><input className={inp} value={form.test_center ?? ""} onChange={e => setForm({ ...form, test_center: e.target.value })} /></Field>
          <Field label="Test Date"><input type="date" className={inp} value={form.test_date ?? ""} onChange={e => setForm({ ...form, test_date: e.target.value })} /></Field>
          <Field label="Result"><select className={inp} value={form.result ?? "PENDING"} onChange={e => setForm({ ...form, result: e.target.value })}>
            {["PENDING", "PASS", "FAIL", "ABSENT"].map(s => <option key={s}>{s}</option>)}
          </select></Field>
          <Field label="Certificate No"><input className={inp} value={form.certificate_no ?? ""} onChange={e => setForm({ ...form, certificate_no: e.target.value })} /></Field>
          <Field label="Issue Date"><input type="date" className={inp} value={form.issue_date ?? ""} onChange={e => setForm({ ...form, issue_date: e.target.value })} /></Field>
          <Field label="Expiry Date"><input type="date" className={inp} value={form.expiry_date ?? ""} onChange={e => setForm({ ...form, expiry_date: e.target.value })} /></Field>
          <Field label="Status"><select className={inp} value={form.status ?? "PENDING"} onChange={e => setForm({ ...form, status: e.target.value })}>
            {["PENDING", "SCHEDULED", "PASSED", "FAILED", "EXPIRED", "USED"].map(s => <option key={s}>{s}</option>)}
          </select></Field>
        </div>
      </Modal>
    </TablePage>
  );
};
