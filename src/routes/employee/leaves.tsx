import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { useAppState, type LeaveType } from "../../hooks/use-app-state";
import {
  CalendarDays,
  Plus,
  X,
  Clock,
  Check,
  Loader2,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/employee/leaves")({
  component: EmployeeLeavesPage,
});

const LEAVE_TYPES: { id: LeaveType; label: string }[] = [
  { id: "annual", label: "Annual / Holiday" },
  { id: "sick", label: "Sick leave" },
  { id: "personal", label: "Personal" },
  { id: "unpaid", label: "Unpaid" },
  { id: "other", label: "Other" },
];

function EmployeeLeavesPage() {
  const { user, leaveRequests, submitLeaveRequest } = useAppState();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>("annual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const myLeaves = useMemo(
    () =>
      leaveRequests.filter(
        (l) => l.employeeEmail.toLowerCase() === (user?.email ?? "").toLowerCase(),
      ),
    [leaveRequests, user?.email],
  );

  const pending = myLeaves.filter((l) => l.status === "pending").length;
  const approved = myLeaves.filter((l) => l.status === "approved").length;
  const rejected = myLeaves.filter((l) => l.status === "rejected").length;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !startDate || !endDate || !reason) return;
    setSubmitting(true);
    try {
      await submitLeaveRequest({
        employeeName: user.name,
        employeeEmail: user.email,
        leaveType,
        startDate,
        endDate,
        reason,
      });
      setShowForm(false);
      setReason("");
      setStartDate("");
      setEndDate("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">My Leaves</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit a leave request. When your manager approves it in the founder portal, you get an email.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 rounded-full gradient-brand-bg px-4 py-2 text-xs font-medium text-primary-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Request leave
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", value: pending, color: "text-yellow-400", icon: Clock },
          { label: "Approved", value: approved, color: "text-emerald-400", icon: Check },
          { label: "Rejected", value: rejected, color: "text-destructive", icon: X },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5 text-center">
            <s.icon className={`mx-auto h-4 w-4 ${s.color}`} />
            <p className={`mt-2 font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {myLeaves.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border/50 py-14 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">You haven&apos;t requested any leave yet.</p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-4 text-xs font-medium text-brand-glow hover:underline"
            >
              Request your first leave →
            </button>
          </div>
        )}
        {myLeaves.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border/40 bg-white/[0.02] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold capitalize">{item.leaveType} leave</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.startDate} → {item.endDate} · {item.days} day{item.days === 1 ? "" : "s"}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                  item.status === "pending"
                    ? "bg-yellow-500/10 text-yellow-400"
                    : item.status === "approved"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-destructive/10 text-destructive"
                }`}
              >
                {item.status}
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{item.reason}</p>
            {item.status === "approved" && (
              <p className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-400">
                <Mail className="h-3 w-3" />
                {item.emailSent
                  ? "Approval email sent to your inbox"
                  : "Approved — check your email for confirmation"}
              </p>
            )}
            {item.reviewerNote && (
              <p className="mt-2 rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-[11px] text-brand-glow">
                Manager note: {item.reviewerNote}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
            <motion.form
              onSubmit={(e) => void onSubmit(e)}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="glass-strong w-full max-w-lg space-y-4 rounded-3xl p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold">Request leave</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submitting as {user?.name} · {user?.email}
                  </p>
                </div>
                <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <label className="block space-y-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">Leave type</span>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/50"
                >
                  {LEAVE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground">Start date</span>
                  <input
                    required
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/50"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground">End date</span>
                  <input
                    required
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/50"
                  />
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">Reason</span>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/50"
                  placeholder="Why are you requesting leave?"
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl gradient-brand-bg px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Submit for approval
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
