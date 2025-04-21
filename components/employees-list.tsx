"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Input } from "@/components/ui/input"
import type { Employee } from "@/lib/types"

export default function EmployeesList() {
  const router = useRouter()
  const { isAdmin, hasPermission } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Check if user has permission to manage employees
  useEffect(() => {
    if (!isAdmin && !hasPermission("manage_employees")) {
      router.push("/dashboard")
    }
  }, [isAdmin, hasPermission, router])

  // Fetch employees
  useEffect(() => {
    async function fetchEmployees() {
      try {
        const response = await fetch("/api/employees")
        if (!response.ok) {
          throw new Error("Failed to fetch employees")
        }
        const data = await response.json()

        // Sort employees alphabetically by name
        const sortedEmployees = [...data].sort((a, b) => a.name.localeCompare(b.name, "hu", { sensitivity: "base" }))

        setEmployees(sortedEmployees)
        setFilteredEmployees(sortedEmployees)
      } catch (error) {
        console.error("Error fetching employees:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  // Filter employees based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = employees.filter(
      (employee) => employee.name.toLowerCase().includes(query) || employee.position.toLowerCase().includes(query),
    )
    setFilteredEmployees(filtered)
  }, [searchQuery, employees])

  if (isLoading) {
    return <div className="text-center p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Alkalmazottak</h1>
        <Link href="/employees/new" className="shrink-0">
          <Button className="w-full sm:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            <span className="whitespace-nowrap">Alkalmazott hozzáadása</span>
          </Button>
        </Link>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Keresés név vagy pozíció alapján..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="text-center p-12 border rounded-lg">
          {employees.length === 0 ? (
            <>
              <h2 className="text-xl font-semibold mb-2">Még nincsenek alkalmazottak</h2>
              <p className="text-muted-foreground mb-4">Adja hozzá az első alkalmazottat a jutalmak követéséhez</p>
              <Link href="/employees/new">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Alkalmazott hozzáadása
                </Button>
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">Nincs találat</h2>
              <p className="text-muted-foreground mb-4">Próbáljon más keresési feltételt</p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Keresés törlése
              </Button>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Desktop view - Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Név</TableHead>
                  <TableHead>Pozíció</TableHead>
                  <TableHead>Foglalkoztatás típusa</TableHead>
                  <TableHead>Műveletek</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                      {employee.employmentType === "full-time"
                        ? "Teljes munkaidő"
                        : employee.employmentType === "part-time"
                          ? "Részmunkaidő"
                          : "Diák"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/employees/${employee.id}`}>
                          <Button variant="outline" size="sm">
                            Megtekintés
                          </Button>
                        </Link>
                        <Link href={`/employees/${employee.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Szerkesztés
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile view - Cards */}
          <div className="md:hidden space-y-4">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{employee.name}</h3>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-secondary">
                    {employee.employmentType === "full-time"
                      ? "Teljes munkaidő"
                      : employee.employmentType === "part-time"
                        ? "Részmunkaidő"
                        : "Diák"}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link href={`/employees/${employee.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Megtekintés
                    </Button>
                  </Link>
                  <Link href={`/employees/${employee.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Szerkesztés
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
