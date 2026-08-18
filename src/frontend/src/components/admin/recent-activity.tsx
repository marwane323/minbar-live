"use client";

import { useApi } from "@/lib/hooks";
import { AuditLogEntry } from "@/lib/types";

export function RecentActivityList() {
  const { data: logs, isLoading } = useApi<AuditLogEntry[]>("/api/admin/audit-log");

  if (isLoading) {
    return <div className="text-gray-400">Loading activity...</div>;
  }

  if (!logs || logs.length === 0) {
    return <div className="text-gray-500">No recent activity.</div>;
  }

  return (
    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
      {logs.map((log) => (
        <div key={log.id} className="flex flex-col gap-1 pb-3 border-b border-zinc-800 last:border-0">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-200">{log.action}</span>
            <span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleDateString()}</span>
          </div>
          <div className="text-xs text-gray-400">
            {log.user_email} • {log.resource_type}
          </div>
        </div>
      ))}
    </div>
  );
}
