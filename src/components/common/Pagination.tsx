import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
};

export const Pagination = ({ page, total, pageSize, onChange }: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-border text-xs text-muted-foreground">
      <span>Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}</span>
      <div className="flex gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1} className="p-1.5 rounded hover:bg-muted disabled:opacity-30"><ChevronLeft size={13} /></button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = Math.max(1, page - 2) + i;
          if (p > totalPages) return null;
          return <button key={p} onClick={() => onChange(p)} className={`px-2.5 py-1 rounded text-xs ${p === page ? "bg-primary text-white" : "hover:bg-muted"}`}>{p}</button>;
        })}
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} className="p-1.5 rounded hover:bg-muted disabled:opacity-30"><ChevronRight size={13} /></button>
      </div>
    </div>
  );
};
