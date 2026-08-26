import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Database, ShieldCheck, Loader2 } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/page-header";
import { useAuth } from "@/lib/auth-context";
import { getAuditLogsServer } from "@/lib/server-system-admin";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/audits")({
  beforeLoad: async () => {
    const { getCurrentSessionServer } = await import("@/lib/server-auth");
    const res = await getCurrentSessionServer();
    if (!res.user || !res.user.isSystemAdmin || res.user.email !== "khade8915@gmail.com") {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [{ title: "System Audits — Bizora Super Admin" }],
  }),
  component: AuditsPage,
});

export function AuditsPage() {
  const { user } = useAuth();
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAudits() {
      setLoading(true);
      try {
        const res = await getAuditLogsServer();
        setAudits(Array.isArray(res?.audits) ? res.audits : []);
      } catch (err) {
        console.warn("Failed to load audit logs:", err);
        setAudits([]);
      } finally {
        setLoading(false);
      }
    }
    loadAudits();
  }, [user]);

  const safeAudits = Array.isArray(audits) ? audits : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 p-6">
      <PageHeader
        title="Security & System Audit Trail"
        subtitle="Review full timestamped logs of admin actions, shopkeeper onboarding events, and tenant security audits."
      />

      <SectionCard title="System Audit Records">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          </div>
        ) : safeAudits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Database className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-base font-bold text-foreground">No audit log records found in database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/50 text-[10px] font-bold uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action Type</th>
                  <th className="px-4 py-3">Auditor Email</th>
                  <th className="px-4 py-3">Workspace ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {safeAudits.map((log: any) => (
                  <tr key={log.id} className="transition-colors hover:bg-surface/30">
                    <td className="px-4 py-3 text-muted-foreground font-mono">
                      {new Date(log.timestamp || Date.now()).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-rose-400">{log.actionType}</td>
                    <td className="px-4 py-3">{log.adminEmail}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono">{log.workspaceId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
