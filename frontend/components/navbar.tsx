"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { H0 } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
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
import { useState } from "react"

interface NavbarProps {
  showLogout: boolean
}

export function Navbar({showLogout}: NavbarProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)  // State to handle dialog visibility

  // Handle logout action
  const handleLogout = async () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    router.push("/login")
    toast.success('Logged out successfully!', {
      style: {
        borderRadius: '6px',
        background: 'var(--card)',
        padding: '10px',
        border: '1px solid var(--border)',
        color: 'var(--text)',
      },
    })
    setIsDialogOpen(false)  // Close the dialog after logout
  }

  return (
    <nav className="fixed top-0 left-0 w-full flex items-center justify-between py-4 px-8 border-b border-dashed bg-foreground-primary">
      <div><H0>ChatBot</H0></div>
      <div>
        <ThemeToggle />
        {showLogout && (
          <>
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)} className="ml-10">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Do you really want to log out?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>
                    Yes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </nav>
  )
}
