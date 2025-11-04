"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download } from "lucide-react"

const API_BASE_URL = "https://hrpayrollmanagementsystembackend.onrender.com"

interface PayslipViewProps {
  credentials: any
}

export default function PayslipView({ credentials }: PayslipViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [payslip, setPayslip] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPayslip()
  }, [selectedMonth, selectedYear])

  const fetchPayslip = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`${API_BASE_URL}/employee/payslip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          month: selectedMonth,
          year: selectedYear,
        }),
      })
      const data = await response.json()
      if (data.ok) {
        setPayslip(data.payslip)
      } else {
        setError(data.error || "Failed to fetch payslip")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/employee/payslip/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
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
      <h2 className="text-2xl font-bold text-white">Your Payslip</h2>

      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div>
            <label className="text-sm text-slate-300 block mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number.parseInt(e.target.value))}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2"
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
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg text-red-300 text-sm mb-4">{error}</div>
        )}

        {payslip ? (
          <div className="space-y-6">
            <div className="border-b border-slate-700 pb-4">
              <h3 className="text-xl font-bold text-white mb-4">Payslip Details</h3>
              <div className="grid md:grid-cols-2 gap-4 text-slate-300 text-sm">
                <div>
                  <span className="text-slate-400">Employee Name:</span> {payslip.employee.name}
                </div>
                <div>
                  <span className="text-slate-400">Employee ID:</span> {payslip.employee.empId}
                </div>
                <div>
                  <span className="text-slate-400">Period:</span> {payslip.month}/{payslip.year}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-slate-300">
                <span>Base Salary:</span>
                <span className="font-medium">${payslip.baseSalary?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Per Day Salary:</span>
                <span className="font-medium">${payslip.perDaySalary?.toFixed(2)}</span>
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
                <span className="font-bold text-blue-400">${payslip.calculatedSalary?.toFixed(2)}</span>
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
          <div className="text-center py-8 text-slate-400">
            {loading ? "Loading payslip..." : "No payslip data available"}
          </div>
        )}
      </Card>
    </div>
  )
}
