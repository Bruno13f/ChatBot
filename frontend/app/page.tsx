"use client"  // Add this to mark the component as a client-side component

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  // Redirect to /login when the component mounts
  useEffect(() => {
    router.push("/login")
  }, [router])

  return null // No need to render anything on the / page
}
