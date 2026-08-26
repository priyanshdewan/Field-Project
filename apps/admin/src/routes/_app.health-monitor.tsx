import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Activity,
  Database,
  HardDrive,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Mail,
  Shield,
} from "lucide-react";
import { PageHeader, SectionCard, StatusPill } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/health-monitor")({
  head: () => ({
    meta: [
      { title: "Health Monitor | Bizora Admin" },
      { name: "description", content: "Real-time system health monitoring with automated alerts." },
    ],
  }),
  component: HealthMonitor,
});

interface ApiEndpointResult {
  name: string;
  path: string;
  status: number | string;
  ok: boolean;
  latencyMs: number;
}

interface HealthReport {
  timestamp: string;
  uptime: number;
  dbStatus: string;
  dbError: string | null;
  responseTimeMs?: number;
  dbResponseTimeMs?: number;
  apiResults?: ApiEndpointResult[];
  entityCounts?: Record<string, number>;
  issuesFound?: string[];
  healedActions?: string[];
  criticalIssuesCount?: number;
  warningIssuesCount?: number;
  memory: {
    rss: number | string;
    heapTotal: number | string;
    heapUsed: number | string;
  };
  system: {
    freeMem: number | string;
    totalMem: number | string;
  };
}

function HealthMonitor() {
  const { user } = useAuth();
  const [report, setReport] = useState<HealthReport | null>(null);
  const [history, setHistory] = useState<HealthReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const API_BASE = typeof window !== "undefined"
    ? (window as any).__BIZORA_API_URL || "https://bizora-backend-gtoe.onrender.com"
    : "";

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      const json = await res.json();
      if (json.data) {
        setReport(json.data);
        setHistory((prev) => [json.data, ...prev].slice(0, 50));
      }
    } catch (err: any) {
      toast.error("Failed to fetch health status: " + (err.message || "Network error"));
      setReport({
        timestamp: new Date().toISOString(),
        uptime: 0,
        dbStatus: "unreachable",
        dbError: err.message || "Backend unreachable",
        responseTimeMs: 0,
        memory: { rss: 0, heapTotal: 0, heapUsed: 0 },
        system: { freeMem: 0, totalMem: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchHealth, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const toBytes = (val: number | string | undefined | null): number => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    const match = String(val).match(/([\d.]+)\s*(MB|GB|KB|B)?/i);
    if (!match) return 0;
    const num = parseFloat(match[1]);
    const unit = (match[2] || "").toUpperCase();
    if (unit === "GB") return num * 1024 * 1024 * 1024;
    if (unit === "MB") return num * 1024 * 1024;
    if (unit === "KB") return num * 1024;
    return num;
  };

  const formatBytes = (bytesVal: number | string) => {
    const bytes = toBytes(bytesVal);
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    if (!seconds) return "0s";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const isHealthy = report?.dbStatus === "up";
  const heapUsedBytes = toBytes(report?.memory?.heapUsed);
  const heapTotalBytes = toBytes(report?.memory?.heapTotal);
  const memPercent = heapTotalBytes
    ? Math.round((heapUsedBytes / heapTotalBytes) * 100)
    : 0;

  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSendTestEmail = async () => {
    setSendingEmail(true);
    try {
      const res = await fetch(`${API_BASE}/api/health/test-email`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast.success("🚨 Test Alert Email Sent!", {
          description: "Check khade8915@gmail.com inbox for the health alert report.",
        });
      } else {
        const msg = json.emailResult?.reason || "Email sending failed.";
        toast.warning("Email Alert Status", { description: msg });
      }
    } catch (err: any) {
      toast.error("Failed to send test email: " + err.message);
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Health Monitor"
        subtitle="Real-time backend health checks with automated email alerts every 5 minutes."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                "gap-1.5 text-xs font-medium",
                autoRefresh && "border-success text-success"
              )}
            >
              <Activity className={cn("h-3.5 w-3.5", autoRefresh && "animate-pulse")} />
              {autoRefresh ? "Live" : "Paused"}
            </Button>
            <Button
              variant="outline"
              onClick={handleSendTestEmail}
              disabled={sendingEmail}
              className="border-hairline bg-surface hover:bg-surface-2 gap-2 text-xs font-semibold"
            >
              {sendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4 text-warning" />}
              Send Test Email
            </Button>
            <Button
              onClick={fetchHealth}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Run Check Now
            </Button>
          </div>
        }
      />

      {/* Status Overview */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className={cn(
          "rounded-xl border p-4 flex flex-col gap-2",
          isHealthy
            ? "border-success/30 bg-success/5"
            : "border-destructive/30 bg-destructive/5"
        )}>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            {isHealthy ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
            System Status
          </div>
          <p className={cn("text-lg font-bold", isHealthy ? "text-success" : "text-destructive")}>
            {report ? (isHealthy ? "All Systems Go" : "Issues Detected") : "Checking..."}
          </p>
        </div>

        <div className="rounded-xl border border-hairline bg-card p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Database className="h-4 w-4" />
            Database
          </div>
          <p className="text-lg font-bold">
            {report?.dbStatus === "up" ? "Connected" : report?.dbStatus || "..."}
          </p>
          {(report?.responseTimeMs !== undefined || report?.dbResponseTimeMs !== undefined) && (
            <p className="text-[10px] text-muted-foreground">
              {report.responseTimeMs ?? report.dbResponseTimeMs ?? 0}ms response
            </p>
          )}
        </div>

        <div className="rounded-xl border border-hairline bg-card p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <HardDrive className="h-4 w-4" />
            Memory Usage
          </div>
          <p className="text-lg font-bold">{memPercent}%</p>
          <p className="text-[10px] text-muted-foreground">
            {formatBytes(report?.memory?.heapUsed || 0)} / {formatBytes(report?.memory?.heapTotal || 0)}
          </p>
        </div>

        <div className="rounded-xl border border-hairline bg-card p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Clock className="h-4 w-4" />
            Uptime
          </div>
          <p className="text-lg font-bold">{formatUptime(report?.uptime || 0)}</p>
          <p className="text-[10px] text-muted-foreground">
            Since {report ? new Date(Date.now() - (report.uptime || 0) * 1000).toLocaleString() : "..."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Monitoring Features */}
        <SectionCard title="Automated Monitoring" subtitle="Active health checks and alerting">
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-hairline">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Scheduled Health Checks</p>
                <p className="text-muted-foreground">Every 5 minutes, the backend automatically runs a full health check</p>
              </div>
              <StatusPill tone="success">Active</StatusPill>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-hairline">
              <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Mail className="h-4 w-4 text-warning" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Email Alerts &amp; Quota Guard</p>
                <p className="text-muted-foreground">Smart threshold: emails send only on 3+ critical errors or DB down (30-min debounce to preserve Resend quota)</p>
              </div>
              <StatusPill tone="success">Smart Active</StatusPill>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-hairline">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">🤖 AI Self-Healing Engine</p>
                <p className="text-muted-foreground">Auto-remediates DB pool drops, memory spikes, and data stock anomalies before triggering alerts</p>
              </div>
              <StatusPill tone="success">Auto-Healing</StatusPill>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-hairline">
              <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center">
                <Database className="h-4 w-4 text-info" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Database Connectivity</p>
                <p className="text-muted-foreground">Tests PostgreSQL connection via Prisma $queryRaw every cycle</p>
              </div>
              <StatusPill tone={report?.dbStatus === "up" ? "success" : "danger"}>
                {report?.dbStatus === "up" ? "Healthy" : "Check"}
              </StatusPill>
            </div>
          </div>
        </SectionCard>

        {/* Recent Check History */}
        <SectionCard title="Check History" subtitle={`Last ${history.length} checks`}>
          <div className="max-h-[320px] overflow-y-auto space-y-1.5 pr-1">
            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">
                No check history yet. Run a check to start.
              </p>
            ) : (
              history.map((h, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-xs border",
                    h.dbStatus === "up"
                      ? "border-hairline bg-card"
                      : "border-destructive/20 bg-destructive/5"
                  )}
                >
                  {h.dbStatus === "up" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                  )}
                  <span className="text-muted-foreground min-w-[120px]">
                    {new Date(h.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="font-medium">
                    DB: {h.dbStatus}
                  </span>
                  <span className="text-muted-foreground ml-auto">
                    {h.responseTimeMs ?? h.dbResponseTimeMs ?? 0}ms · {formatBytes(h.memory?.heapUsed || 0)}
                  </span>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      {/* AI SELF-HEALING ENGINE ACTIVITY LOG */}
      {report?.healedActions && report.healedActions.length > 0 && (
        <SectionCard title="🤖 AI Self-Healing Activity Log" subtitle="Real-time automated issue remediation">
          <div className="space-y-2 text-xs">
            {report.healedActions.map((action, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{action}</span>
                <StatusPill tone="success" className="ml-auto">Healed</StatusPill>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* DEEP API CONTROLLERS & DATABASE ENTITY AUDIT */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* API Controllers Audit */}
        <SectionCard title="Backend API Controllers Audit" subtitle="Live endpoint response & latency checks">
          <div className="space-y-2 text-xs">
            {report?.apiResults && report.apiResults.length > 0 ? (
              report.apiResults.map((api, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-hairline">
                  <div className="flex items-center gap-2">
                    {api.ok ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    <div>
                      <p className="font-semibold text-foreground">{api.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{api.path}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-muted-foreground">{api.latencyMs}ms</span>
                    <StatusPill tone={api.ok ? "success" : "danger"}>
                      {api.ok ? `HTTP ${api.status}` : `ERR ${api.status}`}
                    </StatusPill>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">Run a check to audit API controllers.</p>
            )}
          </div>
        </SectionCard>

        {/* Database Entity Count Audit */}
        <SectionCard title="Database Schema & Record Audit" subtitle="Live PostgreSQL table record counts">
          {report?.entityCounts ? (
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {Object.entries(report.entityCounts).map(([entity, count]) => (
                <div key={entity} className="p-3 rounded-lg bg-surface border border-hairline flex flex-col justify-between">
                  <span className="text-[11px] font-medium capitalize text-muted-foreground">{entity.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-lg font-bold font-mono text-primary mt-1">{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-4 text-center">Run a check to audit database tables.</p>
          )}
        </SectionCard>
      </div>

      {/* Error Details */}
      {report?.dbError && (
        <SectionCard title="Error Details">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-xs font-mono text-destructive whitespace-pre-wrap">
              {report.dbError}
            </p>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
