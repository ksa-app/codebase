import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { sb } from "../../lib/supabase";
import { fmtDate } from "../../utils/format";
import { TablePage, Th, Td } from "../../components/common/Table";
import { Pagination } from "../../components/common/Pagination";
import { Modal } from "../../components/common/Modal";
import { Field, inp } from "../../components/common/Field";

export const CandidatePage = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    let q = sb.from("candidates")
      .select(`id, sl, name, passport_no, country, received_date, created_at, is_deleted, agents:agent(id, full_name, "CODE")`, { count: "exact" })
      .eq("is_deleted", false)
      .order("sl", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (search) q = q.or(`name.ilike.%${search}%,passport_no.ilike.%${search}%`);
    const { data, count } = await q;
    setRows(data || []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    sb.from("agents").select(`id, full_name, "CODE"`).then(({ data }) => setAgents(data || []));
  }, []);

  const openAdd = () => { setEditing(null); setForm({ country: "", received_date: "", passport_no: "", name: "", agent: "" }); setModal(true); };
  const openEdit = (r: any) => { setEditing(r); setForm({ ...r, agent: r.agents?.id ?? "" }); setModal(true); };

  const save = async () => {
    const payload = { name: form.name, passport_no: form.passport_no, country: form.country, received_date: form.received_date || null, agent: form.agent || null, updated_at: new Date().toISOString() };
    if (editing) await sb.from("candidates").update(payload).eq("id", editing.id);
    else await sb.from("candidates").insert({ ...payload, is_deleted: false });
    setModal(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Soft delete this candidate?")) return;
    await sb.from("candidates").update({ is_deleted: true }).eq("id", id);
    load();
  };

  return (
    <TablePage title="Candidates" subtitle="Manage all registered worker candidates" onSearch={(v: string) => { setSearch(v); setPage(1); }}
      actions={<button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90"><Plus size={13} /> Add Candidate</button>}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["SL", "Name", "Passport No", "Country", "Agent", "Received", "Actions"].map(h => <Th key={h}>{h}</Th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">Loading...</td></tr>
              : rows.map(r => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <Td mono>{r.sl ?? "—"}</Td>
                <Td><span className="font-medium text-foreground">{r.name}</span></Td>
                <Td mono>{r.passport_no}</Td>
                <Td><span className="text-muted-foreground">{r.country ?? "—"}</span></Td>
                <Td><span className="text-muted-foreground">{r.agents?.full_name ?? "—"}</span></Td>
                <Td mono>{fmtDate(r.received_date)}</Td>
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

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Candidate" : "Add Candidate"}
        footer={<><button onClick={() => setModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">Cancel</button><button onClick={save} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90">Save</button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name *"><input className={inp} value={form.name ?? ""} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Passport No *"><input className={inp} value={form.passport_no ?? ""} onChange={e => setForm({ ...form, passport_no: e.target.value })} /></Field>
          <Field label="Country"><input className={inp} value={form.country ?? ""} onChange={e => setForm({ ...form, country: e.target.value })} /></Field>
          <Field label="Received Date"><input type="date" className={inp} value={form.received_date ?? ""} onChange={e => setForm({ ...form, received_date: e.target.value })} /></Field>
          <Field label="Agent"><select className={inp} value={form.agent ?? ""} onChange={e => setForm({ ...form, agent: e.target.value })}>
            <option value="">— Select Agent —</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.full_name} ({a.CODE})</option>)}
          </select></Field>
        </div>
      </Modal>
    </TablePage>
  );
};
