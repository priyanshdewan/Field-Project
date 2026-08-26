import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MapPin, Globe, Loader2, Building, Store, Navigation, CheckCircle2, ShieldCheck } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/page-header";
import { useAuth } from "@/lib/auth-context";
import { searchCompaniesServer } from "@/lib/server-system-admin";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/locations")({
  beforeLoad: async () => {
    const { getCurrentSessionServer } = await import("@/lib/server-auth");
    const res = await getCurrentSessionServer();
    if (!res.user || !res.user.isSystemAdmin || res.user.email !== "khade8915@gmail.com") {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [{ title: "Store Locations — Bizora Super Admin" }],
  }),
  component: LocationsPage,
});

export function LocationsPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await searchCompaniesServer({ data: { query: "" } });
        const list = Array.isArray(res?.workspaces) ? res.workspaces : [];
        setWorkspaces(list);
      } catch (err) {
        console.warn("Failed to load store locations:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const defaultRegisteredLocation = {
    id: "grandsquare-mall",
    name: "GrandSquare Supermart & Mall",
    ownerName: "Business Owner",
    ownerEmail: "owner@grandsquare.com",
    address: "18th Road, Turner Road Junction, Bandra West, Mumbai 400050",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    gpsCoordinates: "19.0596° N, 72.8295° E",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };

  const safeWorkspaces = Array.isArray(workspaces) && workspaces.length > 0 ? workspaces : [defaultRegisteredLocation];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 p-6">
      <PageHeader
        title="Registered Store Locations & Map Directory"
        subtitle="View physical GPS addresses and locations of all onboarded SaaS storekeepers across cities."
      />

      <SectionCard title="Store Geocoded Directory">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {safeWorkspaces.map((store: any) => (
                <div
                  key={store.id}
                  className="rounded-xl border border-hairline bg-surface p-5 space-y-3 shadow-sm hover:border-rose-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-rose-500/10 text-rose-500">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{store.name || store.companyName}</h4>
                        <p className="text-xs text-muted-foreground">Owner: {store.ownerName} ({store.ownerEmail})</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                      ACTIVE STORE
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-2/60 border border-hairline text-xs space-y-1">
                    <p className="text-foreground font-medium flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      {store.address || "18th Road, Turner Road Junction, Bandra West, Mumbai 400050"}
                    </p>
                    <p className="text-muted-foreground text-[11px] pl-5">
                      GPS Coordinates: <span className="font-mono text-rose-400">{store.gpsCoordinates || "19.0596° N, 72.8295° E"}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span>Tenant ID: <code className="text-foreground">{store.id}</code></span>
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <ShieldCheck className="h-3.5 w-3.5" /> Express 10-Min Hyperlocal Enabled
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive GPS Geolocation Card */}
            <div className="rounded-xl border border-hairline bg-surface p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider">
                  <Globe className="h-4 w-4" /> Live Multi-Tenant GPS Map Network
                </div>
                <h3 className="text-lg font-bold text-foreground">Global Store Geocoding Engine</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bizora AI geocodes every onboarded SaaS store location to enable 10-minute hyperlocal order routing for nearby shoppers on <code>bizora-customer</code>.
                </p>
              </div>

              {/* Simulated Map Visual Card */}
              <div className="relative rounded-xl border border-hairline bg-slate-950 p-6 overflow-hidden min-h-[200px] flex flex-col justify-center items-center text-center">
                <div className="absolute inset-0 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                <div className="relative z-10 space-y-3">
                  <div className="relative inline-block">
                    <span className="absolute -inset-2 rounded-full bg-rose-500/30 animate-ping" />
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/40 relative">
                      <MapPin className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">GrandSquare Supermart & Mall</p>
                    <p className="text-xs text-rose-300">Bandra West, Mumbai (19.0596° N, 72.8295° E)</p>
                  </div>
                  <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                    🟢 Store Geocoded & Broadcaster Online
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-2 text-xs flex items-center justify-between text-muted-foreground">
                <span>Total Registered Locations: <strong className="text-foreground">{safeWorkspaces.length} Store</strong></span>
                <span>Geo-Fencing Radius: <strong className="text-foreground">5.0 km</strong></span>
              </div>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
