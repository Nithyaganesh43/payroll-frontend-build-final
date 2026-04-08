"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { apiUrl } from "@/lib/api"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface AttendanceMarkingProps {
  credentials: any
}

export default function AttendanceMarking({ credentials }: AttendanceMarkingProps) {
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>("")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [attendance, setAttendance] = useState<any[]>([])
  const [holidays, setHolidays] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)

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

  const fetchEmployeeAttendance = async () => {
    try {
      const response = await fetch(apiUrl("/admin/attendance/view"), {
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
        setHolidays(data.holidays || [])
        setSummary(data.summary || null)
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err)
    }
  }

  const markAttendance = async (employeeId: string, status: "present" | "absent") => {
    if (!selectedDates.length) return

    setLoading(true)
    setError("")
    try {
      const markDates = selectedDates.map((day) =>
        formatDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)),
      )

      const response = await fetch(apiUrl("/admin/attendance/mark"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          employeeId,
          dates: markDates,
          status,
        }),
      })
      const data = await response.json()
      if (data.ok) {
        await fetchEmployeeAttendance()
        setSelectedDates([])
      } else {
        setError(data.error || "Failed to mark attendance")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const markHoliday = async () => {
    const selectedDate = selectedDates.length === 1 ? selectedDates[0] : null
    if (!selectedDate) return

    setLoading(true)
    setError("")
    try {
      const holidayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate)
      const response = await fetch(apiUrl("/admin/holidays/mark"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          date: formatDateKey(holidayDate),
          label: "No Work Day",
        }),
      })
      const data = await response.json()
      if (data.ok) {
        await fetchEmployeeAttendance()
        setSelectedDates([])
      } else {
        setError(data.error || "Failed to mark holiday")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const unmarkHoliday = async () => {
    const selectedDate = selectedDates.length === 1 ? selectedDates[0] : null
    if (!selectedDate) return

    setLoading(true)
    setError("")
    try {
      const holidayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate)
      const response = await fetch(apiUrl("/admin/holidays/unmark"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          date: formatDateKey(holidayDate),
        }),
      })
      const data = await response.json()
      if (data.ok) {
        await fetchEmployeeAttendance()
        setSelectedDates([])
      } else {
        setError(data.error || "Failed to remove holiday")
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

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate(),
    ).padStart(2, "0")}`
  }

  const getHoliday = (day: number) => {
    const dateKey = formatDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
    return holidays.find((holiday) => {
      const holidayDate = new Date(holiday.date)
      return formatDateKey(holidayDate) === dateKey
    })
  }

  const getAttendanceStatus = (day: number) => {
    const dateStr = formatDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
    const record = attendance.find((a) => formatDateKey(new Date(a.date)) === dateStr)
    return record?.status || null
  }

  const handleDateSelection = (day: number) => {
    setSelectedDates((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day)
      }
      return [...prev, day].sort((a, b) => a - b)
    })
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const getDisplayDate = (day: number) => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toLocaleDateString()
  }

  const getSelectionSummary = () => {
    if (selectedDates.length === 0) {
      return "No date selected"
    }

    if (selectedDates.length === 1) {
      return getDisplayDate(selectedDates[0])
    }

    return `${selectedDates.length} dates selected`
  }

  const selectedDate = selectedDates.length === 1 ? selectedDates[0] : null
  const selectedHoliday = selectedDate ? getHoliday(selectedDate) : null
  const selectedHolidayDates = selectedDates.filter((day) => !!getHoliday(day))
  const hasSelectedHoliday = selectedHolidayDates.length > 0

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
                  setSelectedDates([])
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
                  setSelectedDates([])
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
                  setSelectedDates([])
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
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
                  Holiday changes apply to all employees. Sundays are holidays by default.
                </div>
                <div className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-3 text-sm text-cyan-200">
                  Click dates to select multiple days for bulk attendance marking. Click a selected date again to deselect it.
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="border-slate-700 bg-slate-900/50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Present</p>
                    <p className="mt-2 text-2xl font-bold text-green-400">{summary?.presentDays || 0}</p>
                  </Card>
                  <Card className="border-slate-700 bg-slate-900/50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Absent</p>
                    <p className="mt-2 text-2xl font-bold text-red-400">{summary?.absentDays || 0}</p>
                  </Card>
                  <Card className="border-slate-700 bg-slate-900/50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Holidays</p>
                    <p className="mt-2 text-2xl font-bold text-amber-300">{summary?.holidayDays || 0}</p>
                  </Card>
                  <Card className="border-slate-700 bg-slate-900/50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Working Days</p>
                    <p className="mt-2 text-2xl font-bold text-cyan-300">{summary?.workingDays || 0}</p>
                  </Card>
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
                    const holiday = getHoliday(day)
                    return (
                      <button
                        key={day}
                        onClick={() => handleDateSelection(day)}
                        className={`aspect-square flex items-center justify-center rounded-lg transition-colors font-medium text-sm ${
                          holiday
                            ? "bg-amber-500/20 text-amber-200 border-2 border-amber-400"
                            : status === "present"
                            ? "bg-green-600 text-white border-2 border-green-400"
                            : status === "absent"
                              ? "bg-red-600 text-white border-2 border-red-400"
                              : "bg-slate-700 text-white hover:bg-slate-600"
                        } ${selectedDates.includes(day) ? "ring-2 ring-cyan-300 ring-offset-2 ring-offset-slate-800" : ""}`}
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
                    <div className="w-3 h-3 rounded bg-amber-400"></div>
                    <span className="text-slate-300">Holiday / Sunday</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-slate-700"></div>
                    <span className="text-slate-300">No Mark</span>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3 text-sm text-slate-300">
                  {selectedDates.length > 0 ? (
                    selectedDates.length === 1 ? (
                      selectedHoliday ? (
                        <>Selected date {getDisplayDate(selectedDates[0])} is a holiday: {selectedHoliday.label}.</>
                      ) : (
                        <>Selected date {getDisplayDate(selectedDates[0])} is a working day.</>
                      )
                    ) : hasSelectedHoliday ? (
                      <>
                        {selectedDates.length} dates selected, but {selectedHolidayDates.length} are holidays/Sundays. Deselect holidays to bulk mark attendance.
                      </>
                    ) : (
                      <>{selectedDates.length} working dates selected for bulk attendance marking.</>
                    )
                  ) : (
                    <>Select a date to mark attendance or set a holiday. Use Ctrl/Cmd + click for multiple dates.</>
                  )}
                </div>

                <div className="border-t border-slate-700 pt-4 flex flex-wrap gap-2">
                  <Button
                    onClick={() => markAttendance(selectedEmployee, "present")}
                    disabled={loading || !selectedDates.length || hasSelectedHoliday}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {selectedDates.length > 1 ? `Mark Present (${selectedDates.length})` : `Mark Present - ${getSelectionSummary()}`}
                  </Button>
                  <Button
                    onClick={() => markAttendance(selectedEmployee, "absent")}
                    disabled={loading || !selectedDates.length || hasSelectedHoliday}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {selectedDates.length > 1 ? `Mark Absent (${selectedDates.length})` : "Mark Absent"}
                  </Button>
                  <Button
                    onClick={markHoliday}
                    disabled={loading || selectedDates.length !== 1 || !!selectedHoliday}
                    className="flex-1 bg-amber-500 text-slate-950 hover:bg-amber-400"
                  >
                    Mark Holiday
                  </Button>
                  <Button
                    onClick={unmarkHoliday}
                    disabled={loading || selectedDates.length !== 1 || !selectedHoliday || selectedHoliday?.isDefaultSunday}
                    variant="outline"
                    className="flex-1 border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600"
                  >
                    Remove Holiday
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
