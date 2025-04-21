"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { addEmployee } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { translations } from "@/lib/translations"

export default function NewEmployeeForm() {
  const router = useRouter()
  const { isAdmin, hasPermission } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if user has permission to manage employees
  if (!isAdmin && !hasPermission("manage_employees")) {
    router.push("/dashboard")
    return null
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)

    try {
      const result = await addEmployee(formData)

      if (result.error) {
        toast({
          title: translations.error,
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: translations.success,
        description: "Alkalmazott sikeresen hozzáadva",
      })

      router.push("/employees")
    } catch (error) {
      toast({
        title: translations.error,
        description: "Valami hiba történt",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{translations.addEmployee}</CardTitle>
          <CardDescription>Adja meg az új alkalmazott adatait</CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{translations.employeeName}</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">{translations.position}</Label>
              <Input id="position" name="position" required />
            </div>

            <div className="space-y-2">
              <Label>{translations.employmentType}</Label>
              <RadioGroup defaultValue="full-time" name="employmentType" required>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full-time" id="full-time" />
                  <Label htmlFor="full-time">{translations.fullTime}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="part-time" id="part-time" />
                  <Label htmlFor="part-time">{translations.partTime}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student">{translations.student}</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/employees")}>
              {translations.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Hozzáadás..." : translations.add}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
