"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

const API_BASE_URL = "https://hrpayrollmanagementsystembackend.onrender.com"

interface AttendanceMarkingProps {
  credentials: any
}

export default function AttendanceMarking({ credentials }: AttendanceMarkingProps) {
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>("")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [attendance, setAttendance] = useState<any[]>([])

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (selectedEmployee) {
      fetchEmployeeAttendance()
    }
  }, [selectedEmployee, currentDate])

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

  const fetchEmployeeAttendance = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/attendance/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          employeeId: selectedEmployee,
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
        }),
      })
      const data = await response.json()
      if (data.ok) {
        setAttendance(data.attendance || [])
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err)
    }
  }

  const markAttendance = async (employeeId: string, status: "present" | "absent") => {
    setLoading(true)
    setError("")
    try {
      const markDate = selectedDate
        ? new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate)
        : currentDate

      const response = await fetch(`${API_BASE_URL}/admin/attendance/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          employeeId,
          date: markDate.toISOString().split("T")[0],
          status,
        }),
      })
      const data = await response.json()
      if (data.ok) {
        await fetchEmployeeAttendance()
      } else {
        setError(data.error || "Failed to mark attendance")
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

  const getAttendanceStatus = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split("T")[0]
    const record = attendance.find((a) => new Date(a.date).toISOString().split("T")[0] === dateStr)
    return record?.status || null
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const getDisplayDate = () => {
    if (selectedDate) {
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate).toLocaleDateString()
    }
    return currentDate.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Mark Attendance</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Employee Selection */}
        <Card className="md:col-span-1 bg-slate-800 border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Select Employee</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {employees.map((emp) => (
              <button
                key={emp._id}
                onClick={() => {
                  setSelectedEmployee(emp._id)
                  setSelectedEmployeeName(emp.name)
                  setSelectedDate(null)
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                  selectedEmployee === emp._id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                <div className="font-medium">{emp.name}</div>
                <div className="text-xs">{emp.empId}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Calendar */}
        <Card className="md:col-span-2 bg-slate-800 border-slate-700 p-6">
          <div className="space-y-6">
            {/* Month Navigation */}
            <div className="flex justify-between items-center">
              <Button
                onClick={() => {
                  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
                  setSelectedDate(null)
                }}
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
                onClick={() => {
                  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
                  setSelectedDate(null)
                }}
                variant="outline"
                size="sm"
                className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg text-red-300 text-sm">{error}</div>
            )}

            {selectedEmployee ? (
              <div className="space-y-4">
                <div className="p-3 bg-blue-600/20 border border-blue-600/50 rounded-lg text-blue-300 text-sm font-medium">
                  Marking attendance for: {selectedEmployeeName}
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-slate-400 text-sm font-medium py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {emptyDays.map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {days.map((day) => {
                    const status = getAttendanceStatus(day)
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(day)}
                        className={`aspect-square flex items-center justify-center rounded-lg transition-colors font-medium text-sm ${
                          status === "present"
                            ? "bg-green-600 text-white border-2 border-green-400"
                            : status === "absent"
                              ? "bg-red-600 text-white border-2 border-red-400"
                              : selectedDate === day
                                ? "bg-blue-600 text-white border-2 border-blue-400"
                                : "bg-slate-700 text-white hover:bg-slate-600"
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
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

                <div className="border-t border-slate-700 pt-4 flex gap-2">
                  <Button
                    onClick={() => markAttendance(selectedEmployee, "present")}
                    disabled={loading || !selectedDate}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Mark Present - {getDisplayDate()}
                  </Button>
                  <Button
                    onClick={() => markAttendance(selectedEmployee, "absent")}
                    disabled={loading || !selectedDate}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Mark Absent
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">Select an employee to mark attendance</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
