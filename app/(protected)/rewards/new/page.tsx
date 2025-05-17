"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { issueRewardCard } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import type { Employee } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Lock } from "lucide-react"

const translations = {
  issueReward: "Kiadás",
}

export default function NewRewardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedEmployeeId = searchParams.get("employeeId")
  const { managerInfo, isAdmin } = useAuth()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<string>(preselectedEmployeeId || "")
  const [cardType, setCardType] = useState<"basic" | "gold" | "platinum">("basic")
  const [cardId, setCardId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [selectedEmployeeData, setSelectedEmployeeData] = useState<Employee | null>(null)

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const response = await fetch("/api/employees")
        if (!response.ok) {
          throw new Error("Failed to fetch employees")
        }
        const data = await response.json()

        // Filter out locked employees
        const unlocked = data.filter((emp: Employee) => !emp.isLocked)
        setEmployees(unlocked)

        // If no employee is preselected and we have employees, select the first one
        if (!preselectedEmployeeId && unlocked.length > 0 && !selectedEmployee) {
          setSelectedEmployee(unlocked[0].id)
          setSelectedEmployeeData(unlocked[0])
        } else if (preselectedEmployeeId) {
          // Find the preselected employee in the data
          const preselected = data.find((emp: Employee) => emp.id === preselectedEmployeeId)
          if (preselected) {
            setSelectedEmployeeData(preselected)
            // If the preselected employee is locked, show an error
            if (preselected.isLocked) {
              setError(`Ez a munkatárs zárolva van: ${preselected.name}. ${preselected.lockReason || ""}`)
            }
          }
        }
      } catch (error) {
        toast({
          title: "Hiba",
          description: "Munkatársak betöltése sikertelen",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployees()
  }, [preselectedEmployeeId, selectedEmployee])

  // Update selected employee data when selection changes
  useEffect(() => {
    if (selectedEmployee && employees.length > 0) {
      const selected = employees.find((emp) => emp.id === selectedEmployee)
      setSelectedEmployeeData(selected || null)
    }
  }, [selectedEmployee, employees])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (!selectedEmployee || !cardType) {
        setError("Minden mező kitöltése kötelező")
        setIsSubmitting(false)
        return
      }

      // Check if the selected employee is locked
      if (selectedEmployeeData?.isLocked) {
        setError(`Ez a munkatárs zárolva van: ${selectedEmployeeData.name}. ${selectedEmployeeData.lockReason || ""}`)
        setIsSubmitting(false)
        return
      }

      const formData = new FormData()
      formData.append("employeeId", selectedEmployee)
      formData.append("cardType", cardType)

      if (cardId) {
        formData.append("cardId", cardId)
      }

      // Add manager info if available
      if (managerInfo) {
        formData.append("managerApproval", managerInfo.id)
        formData.append("managerName", managerInfo.name)
        formData.append("managerRole", managerInfo.role)
      } else if (isAdmin) {
        formData.append("managerApproval", "admin")
        formData.append("managerName", "Admin")
        formData.append("managerRole", "Admin")
      }

      console.log("Submitting form data")
      const result = await issueRewardCard(formData)

      if (result.error) {
        setError(result.error)
        toast({
          title: "Hiba",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Sikeres",
        description: "Jutalom kártya sikeresen kiadva",
      })

      router.push("/rewards")
    } catch (error) {
      console.error("Error issuing reward:", error)
      setError("Valami hiba történt")
      toast({
        title: "Hiba",
        description: "Valami hiba történt",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p>Betöltés...</p>
      </div>
    )
  }

  if (employees.length === 0) {
    return (
      <div className="text-center p-12 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Nincsenek elérhető munkatársak</h2>
        <p className="text-muted-foreground mb-4">Minden munkatárs zárolva van, vagy még nincs munkatárs</p>
        <Button onClick={() => router.push("/employees/new")}>Munkatárs hozzáadása</Button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Jutalom kiadása</CardTitle>
          <CardDescription className="dark:text-gray-300">Új jutalom kártya kiadása egy munkatársnak</CardDescription>
          {managerInfo && (
            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md text-sm dark:text-gray-200">
              Jóváhagyó: {managerInfo.name} ({managerInfo.role})
            </div>
          )}
          {isAdmin && !managerInfo && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm dark:text-gray-200">
              Admin jóváhagyás
            </div>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Hiba</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {preselectedEmployeeId && selectedEmployeeData?.isLocked ? (
              <Alert variant="destructive">
                <Lock className="h-4 w-4" />
                <AlertTitle>Zárolva</AlertTitle>
                <AlertDescription>
                  Ez a munkatárs zárolva van és nem kaphat jutalmat.
                  {selectedEmployeeData.lockReason && (
                    <div className="mt-1">
                      <span className="font-medium">Ok:</span> {selectedEmployeeData.lockReason}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="dark:text-gray-200">
                    Munkatárs
                  </Label>
                  <Select name="employeeId" value={selectedEmployee} onValueChange={setSelectedEmployee} required>
                    <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      <SelectValue placeholder="Válasszon munkatársat" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700">
                      {employees.map((employee) => (
                        <SelectItem
                          key={employee.id}
                          value={employee.id}
                          className="dark:text-white dark:focus:bg-gray-600"
                        >
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="dark:text-gray-200">Kártya típus</Label>
                  <RadioGroup
                    value={cardType}
                    onValueChange={(value) => setCardType(value as "basic" | "gold" | "platinum")}
                    required
                    className="dark:text-white"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="basic" id="basic" />
                      <Label htmlFor="basic" className="dark:text-gray-200">
                        1 pontos 🥉 (1 pont)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gold" id="gold" />
                      <Label htmlFor="gold" className="dark:text-gray-200">
                        2 pontos 🥈 (2 pont)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="platinum" id="platinum" />
                      <Label htmlFor="platinum" className="dark:text-gray-200">
                        Arany kártya🏅 (3 pont)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardId" className="dark:text-gray-200">
                    Kártya azonosító (opcionális)
                  </Label>
                  <Input
                    id="cardId"
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    placeholder="Hagyja üresen automatikus generáláshoz"
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    Ha üresen hagyja, automatikusan generálunk egy egyedi azonosítót
                  </p>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/rewards")}
              className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Mégse
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedEmployeeData?.isLocked === true}
              className="dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {isSubmitting ? "Kiadás..." : translations.issueReward}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
