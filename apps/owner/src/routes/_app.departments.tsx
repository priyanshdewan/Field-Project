import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { useBusinessData } from "@/lib/business-context";
import { useAuth } from "@/lib/auth-context";
import { fmtINR } from "@/lib/mock-data";
import { TrendingUp, Plus, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getProductOptionsServer } from "@/lib/server-products";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/departments")({
  head: () => ({
    meta: [
      { title: "Departments | Bizora" },
      { name: "description", content: "Department performance, margins, and staff overview." },
    ],
  }),
  component: Departments,
});

function Departments() {
  const { user } = useAuth();
  const { departmentRevenue, staff, transactions } = useBusinessData();
  const [departmentsList, setDepartmentsList] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Add department modal state
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [saving, setSaving] = useState(false);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const opts = await getProductOptionsServer({
        data: { role: user?.role || "owner", email: user?.email || "" },
      });
      const safeDepts = Array.isArray(opts?.departments) ? opts.departments : [];
      setDepartmentsList(safeDepts);
    } catch (err) {
      console.error("Failed to load departments", err);
      setDepartmentsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, [user]);

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) {
      toast.error("Please enter a department name.");
      return;
    }
    setSaving(true);
    try {
      const newDept = {
        id: `dept-${Date.now()}`,
        name: newDeptName.trim(),
      };
      setDepartmentsList((prev) => [...prev, newDept]);
      toast.success(`Department "${newDeptName.trim()}" created successfully!`);
      setNewDeptName("");
      setOpenAddModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create department.");
    } finally {
      setSaving(false);
    }
  };

  const departmentsData = departmentsList.map((dept, i) => {
    const dynamicData = (departmentRevenue || []).find((d: any) => d.name === dept.name);
    const deptValue = dynamicData ? dynamicData.value : 0;
    const actualStaffCount = (staff || []).filter((s: any) => s.dept === dept.name).length;

    const deptTxns = (transactions || []).filter((t: any) => t.dept === dept.name);
    const deptRevenueVal = deptTxns.reduce((sum: number, t: any) => sum + (t.total || 0), 0);
    const deptMargin = deptRevenueVal > 0 ? 18.5 : 0.0;

    return {
      id: dept.id,
      name: dept.name,
      value: deptValue,
      margin: deptMargin,
      color: `var(--chart-${(i % 5) + 1})`,
      staff: actualStaffCount,
    };
  }).sort((a, b) => b.value - a.value);

  const totalDeptRevenue = departmentsData.reduce((sum, d) => sum + d.value, 0) || 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        subtitle="Performance snapshot across all mall departments."
        actions={
          <Button
            onClick={() => setOpenAddModal(true)}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Department
          </Button>
        }
      />

      {departmentsData.length === 0 ? (
        <div className="rounded-2xl border border-hairline bg-surface p-12 text-center space-y-4">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary font-extrabold text-3xl">
            <Building2 className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No Departments Configured</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            There are no active departments in your database. Click "+ Add Department" above to create custom store departments.
          </p>
          <Button
            onClick={() => setOpenAddModal(true)}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add Department
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {departmentsData.map((d, i) => {
            const sharePercent = ((d.value / totalDeptRevenue) * 100).toFixed(1);

            return (
              <div key={d.id || d.name} className="card-elevated p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Department
                    </p>
                    <p className="mt-1 text-lg font-semibold">{d.name}</p>
                  </div>
                  <span
                    className="grid h-9 w-9 place-items-center rounded-md text-primary"
                    style={{
                      background: `color-mix(in oklab, var(--chart-${(i % 5) + 1}) 20%, transparent)`,
                    }}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <Kv label="Revenue" v={fmtINR(d.value, { compact: true })} />
                  <Kv label="Margin" v={`${d.margin.toFixed(1)}%`} tone={d.margin > 0 ? "success" : undefined} />
                  <Kv label="Staff" v={`${d.staff}`} />
                </div>
                <div className="mt-3">
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full"
                      style={{
                        width: `${d.value > 0 ? sharePercent : 0}%`,
                        background: `var(--chart-${(i % 5) + 1})`,
                      }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                    <p>Share of total revenue</p>
                    <p className="font-semibold text-foreground">
                      {d.value > 0 ? sharePercent : "0.0"}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Department Modal */}
      <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDepartment} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="deptName">Department Name</Label>
              <Input
                id="deptName"
                placeholder="e.g. Apparel, Electronics, Grocery"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenAddModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Creating..." : "Save Department"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Kv({ label, v, tone }: { label: string; v: string; tone?: "success" }) {
  return (
    <div className="rounded-md border border-hairline bg-surface p-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-0.5 font-semibold ${tone === "success" ? "text-success" : ""}`}>{v}</p>
    </div>
  );
}
