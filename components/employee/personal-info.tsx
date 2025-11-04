"use client"

import { Card } from "@/components/ui/card"
import { User, Briefcase, DollarSign, Calendar } from "lucide-react"

interface PersonalInfoProps {
  user: any
}

export default function PersonalInfo({ user }: PersonalInfoProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Personal Information</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Full Name</p>
              <p className="text-white text-lg font-semibold">{user?.name}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center text-white">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Employee ID</p>
              <p className="text-white text-lg font-semibold">{user?.empId}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center text-white">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Annual Salary</p>
              <p className="text-white text-lg font-semibold">₹{user?.salary?.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-600 flex items-center justify-center text-white">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Joined Date</p>
              <p className="text-white text-lg font-semibold">{new Date(user?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>
        <div className="space-y-3 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Username:</span>
            <span>{user?.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Role:</span>
            <span className="capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Last Updated:</span>
            <span>{new Date(user?.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
