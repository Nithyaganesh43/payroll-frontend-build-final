"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { apiUrl } from "@/lib/api"
import { Download } from "lucide-react"
import PayslipReport from "@/components/payslip/payslip-report"

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
      const response = await fetch(apiUrl("/employee/payslip"), {
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
        setPayslip(null)
        setError(data.error || "Failed to fetch payslip")
      }
    } catch (err) {
      setPayslip(null)
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    try {
      const response = await fetch(apiUrl("/employee/payslip/pdf"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
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
      <h2 className="text-2xl font-bold text-white">Your Payslip</h2>

      <Card className="border-slate-700 bg-slate-800 p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number.parseInt(e.target.value))}
              className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2025, m - 1).toLocaleDateString("en-US", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number.parseInt(e.target.value))}
              className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
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
          <div className="mb-4 rounded-lg border border-red-700/50 bg-red-900/20 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {payslip ? (
          <div className="space-y-6">
            <PayslipReport payslip={payslip} audience="employee" />

            <Button
              onClick={downloadPDF}
              className="flex w-full items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              Download as PDF
            </Button>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400">
            {loading ? "Loading payslip..." : "No payslip data available"}
          </div>
        )}
      </Card>
    </div>
  )
}
