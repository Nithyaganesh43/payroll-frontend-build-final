"use client"

import { Card } from "@/components/ui/card"

interface PayslipReportProps {
  payslip: any
  audience?: "admin" | "employee"
}

function formatAmount(value?: number) {
  if (typeof value !== "number") {
    return "Rs.0.00"
  }

  return `Rs.${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatPercent(value?: number, decimals = 1) {
  if (typeof value !== "number") {
    return "Unavailable"
  }

  return `${(value * 100).toFixed(decimals)}%`
}

function formatNumber(value?: number, decimals = 3) {
  if (typeof value !== "number") {
    return "Unavailable"
  }

  return value.toFixed(decimals)
}

function getDecisionTone(decision?: string) {
  if (decision === "Eligible for Increment") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
  }

  if (decision === "Monitor for Increment Next Cycle") {
    return "border-amber-500/40 bg-amber-500/10 text-amber-300"
  }

  return "border-rose-500/40 bg-rose-500/10 text-rose-300"
}

function MetricCard({
  label,
  value,
  accent = "text-white",
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${accent}`}>{value}</p>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900/35 px-4 py-3 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-100">{value}</span>
    </div>
  )
}

export default function PayslipReport({ payslip, audience = "admin" }: PayslipReportProps) {
  const decisionTone = getDecisionTone(payslip?.decision)
  const recommendationLabel = audience === "employee" ? "Recommended Salary" : "Recommended Salary (ML)"
  const workingDays = payslip.workingDaysInMonth ?? payslip.totalDaysInMonth ?? 0
  const holidayDays = payslip.holidayDaysInMonth ?? 0
  const absentDays = Math.max(workingDays - (payslip.presentDays || 0), 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-slate-700 bg-slate-900/60 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Decision Summary</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{payslip.decision || "No Increment Recommended"}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                {payslip.reason || "No decision explanation available."}
              </p>
            </div>
            <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${decisionTone}`}>
              {payslip.decision || "No Increment Recommended"}
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <MetricCard label="Calculated Salary" value={formatAmount(payslip.calculatedSalary)} accent="text-blue-300" />
            <MetricCard label={recommendationLabel} value={formatAmount(payslip.recommendedSalary)} accent="text-emerald-300" />
            <MetricCard label="Predicted Increment" value={formatAmount(payslip.predictedIncrement)} accent="text-cyan-300" />
          </div>
        </Card>

        <Card className="border-slate-700 bg-slate-900/60 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Employee Snapshot</p>
          <div className="mt-4 grid gap-3 text-sm">
            <DetailRow label="Employee" value={payslip.employee?.name || "Unavailable"} />
            <DetailRow label="Employee ID" value={payslip.employee?.empId || "Unavailable"} />
            <DetailRow label="Period" value={`${payslip.month}/${payslip.year}`} />
            <DetailRow label="Position" value={payslip.employee?.role || "Unavailable"} />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-slate-700 bg-slate-800 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Payroll Breakdown</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <DetailRow label="Base Salary" value={formatAmount(payslip.baseSalary)} />
            <DetailRow label="Per Day Salary" value={formatAmount(payslip.perDaySalary)} />
            <DetailRow label="Working Days" value={String(workingDays)} />
            <DetailRow label="Holiday Days" value={String(holidayDays)} />
            <DetailRow label="Present Days" value={String(payslip.presentDays || 0)} />
            <DetailRow
              label="Absent Days"
              value={String(absentDays)}
            />
            <DetailRow label="Performance vs Expected" value={String(payslip.performance_vs_expected || "0%")} />
          </div>
        </Card>

        <Card className="border-slate-700 bg-slate-800 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Decision Signals</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <MetricCard label="Attendance" value={formatPercent(payslip.attendanceRatio)} accent="text-white" />
            <MetricCard label="Attendance Trend" value={formatPercent(payslip.attendanceTrend)} accent="text-white" />
            <MetricCard label="Consistency" value={formatPercent(payslip.consistencyScore)} accent="text-white" />
            <MetricCard label="Experience" value={`${payslip.experienceMonths || 0} months`} accent="text-white" />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-blue-700/40 bg-blue-950/30 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-blue-200/70">Why This Decision</p>
          <p className="mt-3 text-sm leading-6 text-blue-100">
            {payslip.reason || "No decision explanation available."}
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.22em] text-blue-200/70">Insight</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            {payslip.insight || "No insight available."}
          </p>
        </Card>

        <Card className="border-slate-700 bg-slate-900/60 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Stability And Confidence</p>
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-slate-700/80 bg-slate-950/50 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Stability Guardrail</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                {payslip.stabilityGuardrail || "Increment recommendations are capped to avoid unstable outliers."}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard
                label="Confidence Score"
                value={typeof payslip.confidence_score === "number" ? payslip.confidence_score.toFixed(2) : "0.30"}
                accent="text-white"
              />
              <MetricCard label="Source" value={payslip.source || payslip.predictionSource || "ml-service"} accent="text-white" />
            </div>
            <p className="text-sm leading-6 text-slate-400">
              {payslip.confidence_note || "Confidence is lower due to insufficient historical data."}
            </p>
          </div>
        </Card>
      </div>

      <Card className="border-slate-700 bg-slate-900/60 p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Model Quality</p>
            <h4 className="mt-2 text-lg font-semibold text-white">ML evaluation metrics used for this recommendation</h4>
          </div>
          <p className="text-xs leading-5 text-slate-500">
            {payslip.model_metrics?.accuracy_definition || "Accuracy reflects how often evaluation predictions stayed within the tolerated increment range."}
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <MetricCard
            label="MAE"
            value={typeof payslip.model_metrics?.mae === "number" ? formatAmount(payslip.model_metrics.mae) : "Unavailable"}
            accent="text-white"
          />
          <MetricCard label="R^2" value={formatNumber(payslip.model_metrics?.r2)} accent="text-white" />
          <MetricCard label="Accuracy (within 10%)" value={formatPercent(payslip.model_metrics?.accuracy)} accent="text-white" />
        </div>
      </Card>
    </div>
  )
}
