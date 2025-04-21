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

export default function AdminLogin({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useAuth()
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const success = login(password)

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
