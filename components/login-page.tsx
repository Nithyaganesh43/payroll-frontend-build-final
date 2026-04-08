"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { apiUrl } from "@/lib/api"
import { AlertCircle, LogIn } from "lucide-react"

interface LoginPageProps {
  onAuthSuccess: (state: any) => void
}

export default function LoginPage({ onAuthSuccess }: LoginPageProps) {
  const [role, setRole] = useState<"admin" | "employee">("admin")
  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("admin123")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const endpoint = role === "admin" ? "/admin/login" : "/employee/login"
      const response = await fetch(apiUrl(endpoint), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!data.ok) {
        setError(data.error || "Login failed")
        return
      }

      const authState = {
        isAuthenticated: true,
        role,
        user: data.user,
        credentials: { username, password },
      }

      localStorage.setItem("authState", JSON.stringify(authState))
      onAuthSuccess(authState)
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = (newRole: "admin" | "employee") => {
    setRole(newRole)
    setUsername("")
    setPassword("")
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 shadow-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-blue-600 mb-4">
              <LogIn className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">HR Payroll System</h1>
            <p className="text-slate-400 text-sm">Role-Based Access Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">Select Role</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleChange("admin")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    role === "admin" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("employee")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    role === "employee" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  Employee
                </button>
              </div>
            </div>

            {role === "admin" && (
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
                <p className="text-xs text-blue-200">
                  <strong>Admin Credentials:</strong>
                  <br />
                  Username: admin
                  <br />
                  Password: admin123
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex gap-2 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
