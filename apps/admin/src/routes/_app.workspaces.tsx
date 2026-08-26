import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Building, Search, User, LogIn, HardDrive, ShieldCheck, Loader2 } from "lucide-react";
import { PageHeader, SectionCard, StatusPill } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { searchCompaniesServer } from "@/lib/server-system-admin";
import { impersonateTenantServer } from "@/lib/server-auth";
import { toast } from "sonner";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/workspaces")({
  beforeLoad: async () => {
    const { getCurrentSessionServer } = await import("@/lib/server-auth");
    const res = await getCurrentSessionServer();
    if (!res.user || !res.user.isSystemAdmin || res.user.email !== "khade8915@gmail.com") {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [{ title: "Store Workspaces — Bizora Super Admin" }],
  }),
  component: WorkspacesPage,
});

export function WorkspacesPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const res = await searchCompaniesServer({ data: { query } });
      setWorkspaces(Array.isArray(res?.workspaces) ? res.workspaces : []);
    } catch (err) {
      console.warn("Failed to fetch workspaces:", err);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  const handleImpersonate = async (workspaceId: string) => {
    if (!confirm("Are you sure you want to log in as this store owner?")) return;
    try {
      await impersonateTenantServer({ data: { workspaceId } });
      toast.success("Impersonating workspace Owner user.");
      window.location.href = "/workspaces";
    } catch (err: any) {
      toast.error(err.message || "Impersonation failed");
    }
  };

  const safeWorkspaces = Array.isArray(workspaces) ? workspaces : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 p-6">
      <PageHeader
        title="Active SaaS Store Workspaces & User Directory"
        subtitle="View all registered storekeeper workspaces, user access limits, active store statuses, and log in directly as store owners."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-elevated p-4 relative overflow-hidden">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Workspaces</p>
          <p className="mt-2 font-display text-3xl font-bold text-rose-500">{safeWorkspaces.length}</p>
          <Building className="absolute right-3 bottom-3 h-8 w-8 text-rose-500/10" />
        </div>
        <div className="card-elevated p-4 relative overflow-hidden">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Registered Users</p>
          <p className="mt-2 font-display text-3xl font-bold text-emerald-500">
            {safeWorkspaces.reduce((sum, w) => sum + (w.users?.length || 0), 0)}
          </p>
          <User className="absolute right-3 bottom-3 h-8 w-8 text-emerald-500/10" />
        </div>
        <div className="card-elevated p-4 relative overflow-hidden">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Status</p>
          <p className="mt-2 font-display text-3xl font-bold text-amber-500">
            {safeWorkspaces.filter((w) => w.status === "ACTIVE").length}
          </p>
          <ShieldCheck className="absolute right-3 bottom-3 h-8 w-8 text-amber-500/10" />
        </div>
      </div>

      <SectionCard
        title="Store Workspaces Directory"
        actions={
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search workspaces by name..."
              className="h-8 w-64 bg-sidebar border border-hairline pl-8 text-xs focus:border-rose-500/50"
            />
          </div>
        }
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          </div>
        ) : safeWorkspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-base font-bold text-foreground">No active store workspaces found in database.</p>
            <p className="text-xs text-muted-foreground mt-1">Approved storekeeper registrations will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/50 text-[10px] font-bold uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Store Workspace</th>
                  <th className="px-4 py-3">Owner Contact</th>
                  <th className="px-4 py-3">Registered Users</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {safeWorkspaces.map((store: any) => (
                  <tr key={store.id} className="transition-colors hover:bg-surface/30">
                    <td className="px-4 py-3">
                      <span className="font-bold text-rose-400 text-sm">{store.name}</span>
                      <br />
                      <span className="font-mono text-[10px] text-muted-foreground">{store.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{store.users?.[0]?.name || "Store Owner"}</span>
                      <br />
                      <span className="text-muted-foreground">{store.users?.[0]?.email || "No Email"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400">
                        {store.users?.length || 1} User(s)
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-rose-400">{store.plan || "Enterprise"}</td>
                    <td className="px-4 py-3">
                      <StatusPill tone={store.status === "ACTIVE" ? "success" : "warning"}>
                        {store.status || "ACTIVE"}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-400 border-rose-500/40 hover:bg-rose-500/10 font-bold"
                        onClick={() => handleImpersonate(store.id)}
                      >
                        <LogIn className="h-3.5 w-3.5 mr-1" /> Login As Storekeeper
                      </Button>
                    </td>
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
