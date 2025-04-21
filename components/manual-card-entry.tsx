"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export default function ManualCardEntry() {
  const router = useRouter()
  const [cardId, setCardId] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!cardId.trim()) {
      toast({
        title: "Hiba",
        description: "Kérjük, adja meg a kártya azonosítóját",
        variant: "destructive",
      })
      return
    }

    router.push(`/rewards/${cardId}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardId">Kártya azonosító</Label>
        <Input
          id="cardId"
          value={cardId}
          onChange={(e) => setCardId(e.target.value)}
          placeholder="Adja meg a kártya azonosítóját"
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Kártya keresése
      </Button>
    </form>
  )
}
