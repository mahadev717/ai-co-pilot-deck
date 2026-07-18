import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import {
  useAppState,
  type LeaveRequest,
  type LeaveStatus,
  type LeaveType,
} from "../../hooks/use-app-state";
import {
  CalendarDays,
  Check,
  Clock,
  Mail,
  Plus,
  X,
  Plane,
  HeartPulse,
  User,
  Ban,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/dashboard/leaves")({
  component: LeavesPage,
});

const LEAVE_TYPES: { id: LeaveType; label: string }[] = [
  { id: "annual", label: "Annual / Holiday" },
  { id: "sick", label: "Sick leave" },
  { id: "personal", label: "Personal" },
  { id: "unpaid", label: "Unpaid" },
  { id: "other", label: "Other" },
];

function statusStyle(status: LeaveStatus) {
  if (status === "pending") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  if (status === "approved") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  return "bg-destructive/10 text-destructive border-destructive/20";
}

function typeIcon(type: LeaveType) {
  if (type === "sick") return HeartPulse;
  if (type === "annual") return Plane;
  if (type === "unpaid") return Ban;
  return CalendarDays;
}

function LeaveCard({
  item,
  busyId,
  onApprove,
  onReject,
}: {
  item: LeaveRequest;
  busyId: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const Icon = typeIcon(item.leaveType);
  const busy = busyId === item.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/40 bg-white/[0.02] p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand-glow">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{item.employeeName}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Mail className="h-3 w-3" />
              {item.employeeEmail}
            </p>
          </div>
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize ${statusStyle(item.status)}`}>
          {item.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Type</p>
          <p className="mt-0.5 font-medium capitalize">{item.leaveType}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">From</p>
          <p className="mt-0.5 font-medium">{item.startDate}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">To</p>
          <p className="mt-0.5 font-medium">{item.endDate}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Days</p>
          <p className="mt-0.5 font-medium">{item.days}</p>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{item.reason}</p>

      {item.reviewerNote && (
        <p className="mt-2 rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-[11px] text-brand-glow">
          Note: {item.reviewerNote}
        </p>
      )}

      {item.status === "pending" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onApprove(item.id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Approve & email
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onReject(item.id)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-1.5 text-[11px] font-medium text-destructive hover:bg-destructive/15 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </button>
        </div>
      ) : (
        <p className="mt-4 text-[10px] text-muted-foreground">
          {item.emailSent
            ? `Employee notified by email · ${item.reviewedAt ? new Date(item.reviewedAt).toLocaleString() : ""}`
            : `Reviewed · email pending`}
        </p>
      )}
    </motion.div>
  );
}

function LeavesPage() {
  const { leaveRequests, teamMembers, submitLeaveRequest, reviewLeaveRequest } = useAppState();
  const [filter, setFilter] = useState<"all" | LeaveStatus>("all");
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [employeeName, setEmployeeName] = useState(teamMembers[0]?.name ?? "");
  const [employeeEmail, setEmployeeEmail] = useState(
    teamMembers[0] ? `${teamMembers[0].name.toLowerCase().replace(/\s+/g, ".")}@company.com` : "",
  );
  const [leaveType, setLeaveType] = useState<LeaveType>("annual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const pending = leaveRequests.filter((l) => l.status === "pending").length;
  const approved = leaveRequests.filter((l) => l.status === "approved").length;
  const rejected = leaveRequests.filter((l) => l.status === "rejected").length;

  const filtered = useMemo(
    () => leaveRequests.filter((l) => filter === "all" || l.status === filter),
    [leaveRequests, filter],
  );

  const pickEmployee = (name: string) => {
    setEmployeeName(name);
    const slug = name.toLowerCase().replace(/\s+/g, ".");
    setEmployeeEmail(`${slug}@company.com`);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!employeeName || !employeeEmail || !startDate || !endDate || !reason) return;
    setSubmitting(true);
    try {
      await submitLeaveRequest({
        employeeName,
        employeeEmail,
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

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    const note =
      status === "approved"
        ? window.prompt("Optional note to include in the approval email:", "Enjoy your time off!") ?? undefined
        : window.prompt("Optional note for the rejection email:", "Please choose different dates.") ?? undefined;
    setBusyId(id);
    try {
      await reviewLeaveRequest(id, status, note || undefined);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Leave & Holidays</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Employees submit leave requests here. Approve them to email the employee automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 rounded-full gradient-brand-bg px-4 py-2 text-xs font-medium text-primary-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          New leave request
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Pending", value: pending, icon: Clock, color: "text-yellow-400" },
          { label: "Approved", value: approved, icon: Check, color: "text-emerald-400" },
          { label: "Rejected", value: rejected, icon: X, color: "text-destructive" },
          { label: "Total", value: leaveRequests.length, icon: CalendarDays, color: "text-brand-glow" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className={`mt-2 font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === f
                ? "gradient-brand-bg text-primary-foreground"
                : "border border-border bg-white/5 text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((item) => (
            <LeaveCard
              key={item.id}
              item={item}
              busyId={busyId}
              onApprove={(id) => void handleReview(id, "approved")}
              onReject={(id) => void handleReview(id, "rejected")}
            />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border/50 py-12 text-center text-sm text-muted-foreground">
            No leave requests in this view.
          </div>
        )}
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
                  <h3 className="font-display text-lg font-semibold">Submit leave request</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Employee or HR can file a request. It appears in the portal until approved.
                  </p>
                </div>
                <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <label className="block space-y-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">Employee</span>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      required
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-white/5 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary/50"
                      placeholder="Full name"
                    />
                  </div>
                  <select
                    className="rounded-xl border border-border bg-white/5 px-2 text-xs outline-none"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) pickEmployee(e.target.value);
                    }}
                  >
                    <option value="">Team…</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <label className="block space-y-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">Employee email (for approval notice)</span>
                <input
                  required
                  type="email"
                  value={employeeEmail}
                  onChange={(e) => setEmployeeEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/50"
                  placeholder="name@company.com"
                />
              </label>

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
                Submit request
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
