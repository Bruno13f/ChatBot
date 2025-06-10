"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { LogOut, Bot } from "lucide-react"
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
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
    setIsDialogOpen(false)
  }

  return (
    <nav className="
      fixed
      w-full h-16 flex-row top-0 left-0
      border-b border-dashed bg-foreground-primary z-50
      flex items-center justify-between px-4 py-2
      sm:flex-row sm:w-full sm:h-16 sm:top-0 sm:left-0 sm:border-b sm:border-r-0
      md:flex-row md:w-full md:h-16 md:top-0 md:left-0 md:border-b md:border-r-0
      lg:flex-col lg:w-16 lg:h-full lg:top-0 lg:left-0 lg:border-b-0 lg:border-r
    ">
      {/* "ChatBot" text */}
      <div className="
        flex items-center justify-center
        lg:flex-col lg:items-center lg:justify-start
        h-full lg:h-auto lg:mt-10
      ">
        <span
          className="text-2xl font-bold tracking-widest text-foreground select-none"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            letterSpacing: "0.2em",
          }}
          title="ChatBot"
        >
          <span className="hidden lg:inline">ChatBot</span>
          <span className="inline lg:hidden" style={{writingMode: "horizontal-tb", transform: "none"}}>ChatBot</span>
        </span>
      </div>
      {/* Icons */}
      <div className="
        flex flex-row items-center
        lg:flex-col lg:flex-1
      ">
        <span title="Toggle Theme" className="lg:mt-30">
          <ThemeToggle />
        </span>
        {showLogout && (
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDialogOpen(true)}
                title="Logout"
              >
                <LogOut className="w-6 h-6" />
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
        )}
      </div>
    </nav>
  )
}
