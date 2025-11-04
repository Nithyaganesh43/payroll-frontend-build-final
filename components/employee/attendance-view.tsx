"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const API_BASE_URL = "https://hrpayrollmanagementsystembackend.onrender.com"

interface AttendanceViewProps {
  credentials: any
}

export default function AttendanceView({ credentials }: AttendanceViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [attendance, setAttendance] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAttendance()
  }, [currentDate])

  const fetchAttendance = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`${API_BASE_URL}/employee/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
        }),
      })
      const data = await response.json()
      if (data.ok) {
        setAttendance(data.attendance || [])
        setSummary(data.summary)
      } else {
        setError(data.error || "Failed to fetch attendance")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const getAttendanceStatus = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split("T")[0]
    const record = attendance.find((a) => new Date(a.date).toISOString().split("T")[0] === dateStr)
    return record?.status || null
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Your Attendance</h2>

      {error && <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg text-red-300">{error}</div>}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Summary Cards */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <p className="text-slate-400 text-sm mb-2">Present Days</p>
          <p className="text-3xl font-bold text-green-400">{summary?.presentDays || 0}</p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-6">
          <p className="text-slate-400 text-sm mb-2">Absent Days</p>
          <p className="text-3xl font-bold text-red-400">{summary?.absentDays || 0}</p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-6">
          <p className="text-slate-400 text-sm mb-2">Total Records</p>
          <p className="text-3xl font-bold text-blue-400">{summary?.totalRecords || 0}</p>
        </Card>
      </div>

      {/* Calendar */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              variant="outline"
              size="sm"
              className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-lg font-semibold text-white">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <Button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              variant="outline"
              size="sm"
              className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-slate-400 text-sm font-medium py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {days.map((day) => {
                const status = getAttendanceStatus(day)
                return (
                  <div
                    key={day}
                    className={`aspect-square flex items-center justify-center rounded-lg font-medium text-sm ${
                      status === "present"
                        ? "bg-green-600/30 border border-green-600 text-green-300"
                        : status === "absent"
                          ? "bg-red-600/30 border border-red-600 text-red-300"
                          : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {day}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-4 text-sm pt-4 border-t border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-600"></div>
              <span className="text-slate-300">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-600"></div>
              <span className="text-slate-300">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-slate-700"></div>
              <span className="text-slate-300">No Mark</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
