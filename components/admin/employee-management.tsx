"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { apiUrl } from "@/lib/api"
import { Trash2, Plus, Edit2, X, Check } from "lucide-react"

interface EmployeeManagementProps {
  credentials: any
}

export default function EmployeeManagement({ credentials }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    username_new: "",
    password_new: "",
    salary: "",
    empId: "",
  })
  const [editFormData, setEditFormData] = useState({
    name: "",
    salary: "",
    password_new: "",
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const response = await fetch(apiUrl("/admin/employees/create"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          name: formData.name,
          username_new: formData.username_new,
          password_new: formData.password_new,
          salary: Number.parseInt(formData.salary),
          empId: formData.empId,
        }),
      })
      const data = await response.json()
      if (data.ok) {
        setFormData({ name: "", username_new: "", password_new: "", salary: "", empId: "" })
        setShowCreateForm(false)
        await fetchEmployees()
      } else {
        setError(data.error || "Failed to create employee")
      }
    } catch (err) {
      setError("Network error")
    }
  }

  const handleEditEmployee = async (employeeId: string) => {
    setError("")
    try {
      const response = await fetch(apiUrl("/admin/employees/update"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          employeeId,
          name: editFormData.name,
          salary: Number.parseInt(editFormData.salary),
          ...(editFormData.password_new && { password_new: editFormData.password_new }),
        }),
      })
      const data = await response.json()
      if (data.ok) {
        setEditingId(null)
        setEditFormData({ name: "", salary: "", password_new: "" })
        await fetchEmployees()
      } else {
        setError(data.error || "Failed to update employee")
      }
    } catch (err) {
      setError("Network error")
    }
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm("Are you sure?")) return
    try {
      const response = await fetch(apiUrl("/admin/employees/delete"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          employeeId,
        }),
      })
      const data = await response.json()
      if (data.ok) {
        await fetchEmployees()
      }
    } catch (err) {
      setError("Failed to delete employee")
    }
  }

  const startEdit = (employee: any) => {
    setEditingId(employee._id)
    setEditFormData({
      name: employee.name,
      salary: employee.salary.toString(),
      password_new: "",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Employee Management</h2>
        <Button
          onClick={() => {
            setShowCreateForm(!showCreateForm)
            setFormData({ name: "", username_new: "", password_new: "", salary: "", empId: "" })
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </Button>
      </div>

      {error && <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg text-red-300">{error}</div>}

      {showCreateForm && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Employee</h3>
          <form onSubmit={handleCreateEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
            <Input
              placeholder="Username"
              value={formData.username_new}
              onChange={(e) => setFormData({ ...formData, username_new: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={formData.password_new}
              onChange={(e) => setFormData({ ...formData, password_new: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
            <Input
              placeholder="Employee ID"
              value={formData.empId}
              onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
            <Input
              type="number"
              placeholder="Salary"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
            <div className="flex gap-2">
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Create
              </Button>
              <Button
                type="button"
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {employees.map((employee) => (
          <Card key={employee._id} className="bg-slate-800 border-slate-700 p-4">
            {editingId === employee._id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleEditEmployee(employee._id)
                }}
                className="space-y-4"
              >
                <h4 className="text-sm font-semibold text-blue-400 mb-4">Editing: {employee.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Full Name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Salary"
                    value={editFormData.salary}
                    onChange={(e) => setEditFormData({ ...editFormData, salary: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                  <Input
                    type="password"
                    placeholder="New Password (optional)"
                    value={editFormData.password_new}
                    onChange={(e) => setEditFormData({ ...editFormData, password_new: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Save
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setEditingId(null)}
                    variant="outline"
                    className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{employee.name}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm text-slate-400">
                      <div>
                        <span className="text-slate-500">Username:</span> {employee.username}
                      </div>
                      <div>
                        <span className="text-slate-500">Employee ID:</span> {employee.empId}
                      </div>
                      <div>
                        <span className="text-slate-500">Salary:</span> ₹{employee.salary?.toLocaleString()}
                      </div>
                      <div>
                        <span className="text-slate-500">Role:</span> {employee.role}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => startEdit(employee)}
                      variant="outline"
                      size="sm"
                      className="bg-blue-600/20 border-blue-600/50 text-blue-400 hover:bg-blue-600/30 flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteEmployee(employee._id)}
                      variant="outline"
                      size="sm"
                      className="bg-red-600/20 border-red-600/50 text-red-400 hover:bg-red-600/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
