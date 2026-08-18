import { PageShell } from "@/components/layout/page-shell";
import { SessionArchive } from "@/components/admin/session-archive";

export default function AdminSessionsPage() {
  return (
    <PageShell 
      title="Session Archives" 
      description="View, search, and export past Khutba sessions."
    >
      <div className="bg-[#121214] border border-zinc-800 rounded-lg p-6">
        <SessionArchive />
      </div>
    </PageShell>
  );
}
