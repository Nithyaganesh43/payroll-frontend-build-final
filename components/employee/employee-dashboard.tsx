"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, User, Calendar, FileText } from "lucide-react"
import PersonalInfo from "./personal-info"
import AttendanceView from "./attendance-view"
import PayslipView from "./payslip-view"

interface EmployeeDashboardProps {
  user: any
  credentials: any
  onLogout: () => void
}

export default function EmployeeDashboard({ user, credentials, onLogout }: EmployeeDashboardProps) {
  const [activeTab, setActiveTab] = useState<"info" | "attendance" | "payslip">("info")

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
              <p className="text-xs text-slate-400">Employee Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-white text-sm font-medium">{user?.name}</p>
              <p className="text-slate-400 text-xs">{user?.empId}</p>
            </div>
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
              { id: "info", label: "Personal Info", icon: User },
              { id: "attendance", label: "Attendance", icon: Calendar },
              { id: "payslip", label: "Payslip", icon: FileText },
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
        {activeTab === "info" && <PersonalInfo user={user} />}
        {activeTab === "attendance" && <AttendanceView credentials={credentials} />}
        {activeTab === "payslip" && <PayslipView credentials={credentials} />}
      </div>
    </div>
  )
}
