'use client'

import { Navbar } from "@/components/navbar"
import * as React from "react"
import { MainCard } from "@/components/main-card"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ChatbotPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)


  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")
      const storedUserId = localStorage.getItem("userId")
      setUserId(storedUserId)
    
      if (!token || !storedUserId) {
        router.push("/login")
        return
      }
    
      const validateToken = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/validate-token`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId: storedUserId }),
          })
    
          if (!res.ok) {
            // Token invalid or expired
            router.push("/login")
          } else {
            setLoading(false)
          }
        } catch (error) {
          console.error("Token validation failed:", error)
          router.push("/login")
        }
      }
    
      await validateToken()
    }

    fetchData()
  }, [router])  

  if (loading) {
    return null
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar showLogout={true} />
      <section className="flex-1 flex flex-col justify-center items-center text-center gap-8 md:pl-4 mt-12 sm:ml-0 md:mt-20 md:ml-0 lg:mt-0 lg:ml-10">
        <MainCard userId={userId || ""} />
      </section>
    </main>
  )
}
