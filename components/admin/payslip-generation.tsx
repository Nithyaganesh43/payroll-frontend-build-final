"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Eye } from "lucide-react"

const API_BASE_URL = "https://hrpayrollmanagementsystembackend.onrender.com"

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
      const response = await fetch(`${API_BASE_URL}/admin/employees/list`, {
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
      const response = await fetch(`${API_BASE_URL}/admin/payslip/generate`, {
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
        setError(data.error || "Failed to generate payslip")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    if (!selectedEmployee) return
    try {
      const response = await fetch(`${API_BASE_URL}/admin/payslip/pdf`, {
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
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `payslip-${selectedMonth}-${selectedYear}.pdf`
      a.click()
    } catch (err) {
      setError("Failed to download PDF")
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Generate Payslips</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Selection Panel */}
        <Card className="md:col-span-1 bg-slate-800 border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Select Details</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 block mb-2">Employee</label>
              <select
                value={selectedEmployee || ""}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2"
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
              <label className="text-sm text-slate-300 block mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number.parseInt(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2025, m - 1).toLocaleDateString("en-US", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-300 block mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number.parseInt(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              Generate Payslip
            </Button>
          </div>
        </Card>

        {/* Payslip Display */}
        <Card className="md:col-span-2 bg-slate-800 border-slate-700 p-6">
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg text-red-300 text-sm mb-4">
              {error}
            </div>
          )}

          {payslip ? (
            <div className="space-y-6">
              <div className="border-b border-slate-700 pb-4">
                <h3 className="text-xl font-bold text-white mb-2">Payslip</h3>
                <div className="grid md:grid-cols-2 gap-4 text-slate-300 text-sm">
                  <div>
                    <span className="text-slate-400">Employee:</span> {payslip.employee.name}
                  </div>
                  <div>
                    <span className="text-slate-400">Employee ID:</span> {payslip.employee.empId}
                  </div>
                  <div>
                    <span className="text-slate-400">Period:</span> {payslip.month}/{payslip.year}
                  </div>
                  <div>
                    <span className="text-slate-400">Position:</span> {payslip.employee.role}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-slate-300">
                  <span>Base Salary:</span>
                  <span className="font-medium">₹{payslip.baseSalary?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Per Day Salary:</span>
                  <span className="font-medium">₹{payslip.perDaySalary?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Total Days in Month:</span>
                  <span className="font-medium">{payslip.totalDaysInMonth}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Present Days:</span>
                  <span className="font-medium text-green-400">{payslip.presentDays}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Absent Days:</span>
                  <span className="font-medium text-red-400">{payslip.totalDaysInMonth - payslip.presentDays}</span>
                </div>

                <div className="border-t border-slate-700 pt-3 flex justify-between text-lg">
                  <span className="text-white font-semibold">Calculated Salary:</span>
                  <span className="font-bold text-blue-400">₹{payslip.calculatedSalary?.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={downloadPDF}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download as PDF
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">Select employee and click Generate to view payslip</div>
          )}
        </Card>
      </div>
    </div>
  )
}
