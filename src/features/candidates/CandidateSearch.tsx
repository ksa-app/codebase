import { useState, useCallback } from "react";
import { sb } from "../../lib/supabase";
import { inp } from "../../components/common/Field";

type CandidateSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (candidate: any) => void;
};

export const CandidateSearch = ({ value, onChange, onSelect }: CandidateSearchProps) => {
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q) { setResults([]); return; }
    const { data } = await sb.from("candidates")
      .select("id, name, passport_no, sl")
      .eq("is_deleted", false)
      .or(`name.ilike.%${q}%,passport_no.ilike.%${q}%`)
      .limit(8);
    setResults(data || []);
    setOpen(true);
  }, []);

  return (
    <div className="relative">
      <input className={inp} value={value} onChange={e => { onChange(e.target.value); search(e.target.value); }} placeholder="নাম বা পাসপোর্ট নম্বর..." />
      {open && results.length > 0 && (
        <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {results.map(c => (
            <div key={c.id} className="px-3 py-2 hover:bg-muted/40 cursor-pointer text-sm" onClick={() => { onSelect(c); setOpen(false); onChange(c.name); }}>
              <span className="font-medium">{c.name}</span>
              <span className="text-muted-foreground text-xs ml-2">{c.passport_no}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
