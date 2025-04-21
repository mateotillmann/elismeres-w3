"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteCard } from "@/app/actions"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { translations } from "@/lib/translations"
import { Trash2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import AdminLogin from "./admin-login"

export default function DeleteCardButton({ cardId, isRedeemed = false }: { cardId: string; isRedeemed?: boolean }) {
  const router = useRouter()
  const { isAdmin, hasPermission } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)

  async function handleDelete() {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("cardId", cardId)

      const result = await deleteCard(formData)

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
        description: "Jutalom kártya sikeresen törölve",
      })

      router.refresh()
      router.push("/rewards")
    } catch (error) {
      toast({
        title: translations.error,
        description: "Valami hiba történt",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsOpen(false)
      setShowAdminLogin(false)
    }
  }

  const handleOpenDialog = () => {
    if (isAdmin) {
      setIsOpen(true)
    } else {
      setShowAdminLogin(true)
    }
  }

  // Only admin can delete redeemed cards
  if (isRedeemed && !isAdmin) {
    return null
  }

  if (showAdminLogin) {
    return (
      <AlertDialog open={true} onOpenChange={() => setShowAdminLogin(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{translations.adminLogin}</AlertDialogTitle>
          </AlertDialogHeader>
          <AdminLogin
            onSuccess={() => {
              setShowAdminLogin(false)
              setIsOpen(true)
            }}
          />
          <AlertDialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowAdminLogin(false)}>
              {translations.cancel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" onClick={handleOpenDialog}>
          <Trash2 className="h-4 w-4 mr-2" />
          {translations.delete}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{translations.confirmDelete}</AlertDialogTitle>
          <AlertDialogDescription>{translations.thisActionCannotBeUndone}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{translations.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isSubmitting}>
            {isSubmitting ? "Törlés..." : translations.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
