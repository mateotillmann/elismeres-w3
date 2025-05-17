"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { translations } from "@/lib/translations"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define admin accounts for selection
const ADMIN_ACCOUNTS = [
  { id: "admin1", name: "Szabó Dávid" },
  { id: "admin2", name: "Pompor Máté" },
]

export default function AdminLogin({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useAuth()
  const [password, setPassword] = useState("")
  const [selectedAdmin, setSelectedAdmin] = useState(ADMIN_ACCOUNTS[0].id)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const success = login(password, selectedAdmin)

    if (success) {
      toast({
        title: translations.success,
        description: "Sikeres bejelentkezés",
      })
      if (onSuccess) {
        onSuccess()
      }
    } else {
      toast({
        title: translations.error,
        description: translations.incorrectPassword,
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{translations.adminLogin}</CardTitle>
        <CardDescription>Adja meg az adminisztrátori jelszót a folytatáshoz</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-select">Admin felhasználó</Label>
              <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                <SelectTrigger id="admin-select">
                  <SelectValue placeholder="Válasszon admin felhasználót" />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_ACCOUNTS.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{translations.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Bejelentkezés..." : translations.login}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
