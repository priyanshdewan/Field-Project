import { createFileRoute } from "@tanstack/react-router";
import { useBusinessData } from "@/lib/business-context";
import { fmtINR } from "@/lib/mock-data";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getIncomingPaymentsServer, recordIncomingRevenueServer } from "@/lib/server-ledger";
import { toast } from "sonner";
import { PageHeader, SectionCard, StatusPill } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Wallet,
  TrendingUp,
  DollarSign,
  Search,
} from "lucide-react";

export const Route = createFileRoute("/_app/income")({
  head: () => ({
    meta: [
      { title: "Settlement Invoices | Bizora" },
      {
        name: "description",
        content: "Vendor settlement invoices and incoming payments ledger.",
      },
    ],
  }),
  component: RouteComponent,
});

interface IncomingPayment {
  id: string;
  journalId: string;
  accountCode: string;
  accountName: string;
  amount: number;
  description: string;
  date: string;
  referenceType: string | null;
  referenceId: string | null;
}

function RouteComponent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<IncomingPayment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      const res = await getIncomingPaymentsServer();
      setPayments(Array.isArray(res) ? (res as IncomingPayment[]) : []);
    } catch (err) {
      console.warn("Failed to load incoming payments history:", err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const safePayments = Array.isArray(payments) ? payments : [];

  const filteredInflows = safePayments.filter((inf) => {
    const query = searchQuery.toLowerCase();
    return (
      (inf.description || "").toLowerCase().includes(query) ||
      (inf.accountName || "").toLowerCase().includes(query) ||
      (inf.amount || "").toString().includes(query)
    );
  });

  const totalInflow = safePayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settlement Invoices & Cash Receipts"
        subtitle="Vendor settlement invoices, incoming corporate payments, and general ledger receipts."
      />

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          label="Total Settled Income"
          value={totalInflow}
          format="inr"
          icon={<Wallet className="h-5 w-5 text-emerald-500" />}
        />
        <KpiCard
          label="Settled Invoices Count"
          value={safePayments.length}
          format="num"
          icon={<TrendingUp className="h-5 w-5 text-indigo-500" />}
        />
        <KpiCard
          label="Pending Cash Settlements"
          value={0}
          format="inr"
          icon={<DollarSign className="h-5 w-5 text-amber-500" />}
        />
      </div>

      <SectionCard
        title="Ledger of Settlement Receipts"
        actions={
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs w-48 lg:w-64"
            />
          </div>
        }
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredInflows.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">
            No settlement invoice receipts found in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 text-zinc-500 font-medium border-y text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Invoice / Account</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Settled Amount</th>
                  <th className="px-4 py-3 text-center">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredInflows.map((inf) => (
                  <tr key={inf.id} className="hover:bg-zinc-50/50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-zinc-900">{inf.accountName || "Settlement Account"}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        Code: {inf.accountCode}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 max-w-xs truncate">{inf.description}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">
                      +{fmtINR(inf.amount)}
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-500 text-xs">
                      {new Date(inf.date || Date.now()).toLocaleString("en-IN")}
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
