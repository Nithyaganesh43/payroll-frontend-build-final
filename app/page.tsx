"use client"

import { useEffect, useState } from "react"
import LoginPage from "@/components/login-page"
import AdminDashboard from "@/components/admin/admin-dashboard"
import EmployeeDashboard from "@/components/employee/employee-dashboard"

export default function Home() {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean
    role: "admin" | "employee" | null
    user: any
    credentials: { username: string; password: string } | null
  }>({
    isAuthenticated: false,
    role: null,
    user: null,
    credentials: null,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("authState")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setAuthState(parsed)
        setLoading(false) // moved setLoading to inside the try block to ensure it's called
      } catch (err) {
        console.error("[v0] Error parsing stored auth state:", err)
        localStorage.removeItem("authState")
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authState.isAuthenticated) {
    return <LoginPage onAuthSuccess={setAuthState} />
  }

  if (authState.role === "admin") {
    return (
      <AdminDashboard
        user={authState.user}
        credentials={authState.credentials}
        onLogout={() => {
          localStorage.removeItem("authState")
          setAuthState({
            isAuthenticated: false,
            role: null,
            user: null,
            credentials: null,
          })
        }}
      />
    )
  }

  return (
    <EmployeeDashboard
      user={authState.user}
      credentials={authState.credentials}
      onLogout={() => {
        localStorage.removeItem("authState")
        setAuthState({
          isAuthenticated: false,
          role: null,
          user: null,
          credentials: null,
        })
      }}
    />
  )
}
