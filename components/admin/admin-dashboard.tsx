"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Users, Calendar, FileText } from "lucide-react"
import EmployeeManagement from "./employee-management"
import AttendanceMarking from "./attendance-marking"
import PayslipGeneration from "./payslip-generation"

interface AdminDashboardProps {
  user: any
  credentials: any
  onLogout: () => void
}

export default function AdminDashboard({ user, credentials, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"employees" | "attendance" | "payslip">("employees")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              HR
            </div>
            <div>
              <h1 className="text-white font-bold">HR Payroll System</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-300 text-sm">{user?.name}</span>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-red-600/20 border-red-600/50 text-red-400 hover:bg-red-600/30"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="border-t border-slate-700 px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2">
            {[
              { id: "employees", label: "Employees", icon: Users },
              { id: "attendance", label: "Attendance", icon: Calendar },
              { id: "payslip", label: "Payslips", icon: FileText },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === id
                    ? "text-blue-400 border-blue-600"
                    : "text-slate-400 border-transparent hover:text-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "employees" && <EmployeeManagement credentials={credentials} />}
        {activeTab === "attendance" && <AttendanceMarking credentials={credentials} />}
        {activeTab === "payslip" && <PayslipGeneration credentials={credentials} />}
      </div>
    </div>
  )
}
