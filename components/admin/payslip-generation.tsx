"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { apiUrl } from "@/lib/api"
import { Download, Eye } from "lucide-react"
import PayslipReport from "@/components/payslip/payslip-report"

interface PayslipGenerationProps {
  credentials: any
}

export default function PayslipGeneration({ credentials }: PayslipGenerationProps) {
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [payslip, setPayslip] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch(apiUrl("/admin/employees/list"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      })
      const data = await response.json()
      if (data.ok) {
        setEmployees(data.employees || [])
      }
    } catch (err) {
      setError("Failed to fetch employees")
    }
  }

  const generatePayslip = async () => {
    if (!selectedEmployee) return
    setLoading(true)
    setError("")
    try {
      const response = await fetch(apiUrl("/admin/payslip/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          employeeId: selectedEmployee,
          month: selectedMonth,
          year: selectedYear,
        }),
      })
      const data = await response.json()
      if (data.ok) {
        setPayslip(data.payslip)
      } else {
        setPayslip(null)
        setError(data.error || "Failed to generate payslip")
      }
    } catch (err) {
      setPayslip(null)
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    if (!selectedEmployee) return
    try {
      const response = await fetch(apiUrl("/admin/payslip/pdf"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          employeeId: selectedEmployee,
          month: selectedMonth,
          year: selectedYear,
        }),
      })
      if (!response.ok) {
        throw new Error("Failed to generate payslip PDF")
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `payslip-${selectedMonth}-${selectedYear}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError("Failed to download PDF")
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Generate Payslips</h2>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 md:col-span-1 border-slate-700 bg-slate-800">
          <h3 className="mb-4 text-lg font-semibold text-white">Select Details</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Employee</label>
              <select
                value={selectedEmployee || ""}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
              >
                <option value="">Choose employee...</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.empId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number.parseInt(e.target.value))}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2025, m - 1).toLocaleDateString("en-US", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number.parseInt(e.target.value))}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={generatePayslip}
              disabled={!selectedEmployee || loading}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <Eye className="mr-2 h-4 w-4" />
              Generate Payslip
            </Button>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2 border-slate-700 bg-slate-800">
          {error && (
            <div className="mb-4 rounded-lg border border-red-700/50 bg-red-900/20 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {payslip ? (
            <div className="space-y-6">
              <PayslipReport payslip={payslip} audience="admin" />

              <Button
                onClick={downloadPDF}
                className="flex w-full items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700"
              >
                <Download className="h-4 w-4" />
                Download as PDF
              </Button>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">Select employee and click Generate to view payslip</div>
          )}
        </Card>
      </div>
    </div>
  )
}
