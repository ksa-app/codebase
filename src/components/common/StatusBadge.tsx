const STATUS_STYLES: Record<string, string> = {
  FIT: "bg-green-100 text-green-700", UNFIT: "bg-red-100 text-red-700",
  "N/A": "bg-gray-100 text-gray-500", NEW: "bg-blue-100 text-blue-700",
  USED: "bg-purple-100 text-purple-700", EXPIRED: "bg-orange-100 text-orange-700",
  APPROVED: "bg-green-100 text-green-700", PENDING: "bg-yellow-100 text-yellow-700",
  REJECTED: "bg-red-100 text-red-700", PROCESSING: "bg-blue-100 text-blue-700",
  PASSED: "bg-green-100 text-green-700", FAILED: "bg-red-100 text-red-700",
  SCHEDULED: "bg-blue-100 text-blue-700", OFFICE: "bg-green-100 text-green-700",
  MEDICAL: "bg-yellow-100 text-yellow-700", MOFA: "bg-purple-100 text-purple-700",
  EMBASSY: "bg-cyan-100 text-cyan-700", AGENCY: "bg-pink-100 text-pink-700",
  CANDIDATE: "bg-red-100 text-red-700", POLICE: "bg-orange-100 text-orange-700",
  TAKAMUL: "bg-teal-100 text-teal-700", COURIER: "bg-indigo-100 text-indigo-700",
};

export const StatusBadge = ({ status }: { status: string }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-mono ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}>
    {status}
  </span>
);
