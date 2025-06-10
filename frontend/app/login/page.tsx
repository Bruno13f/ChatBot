import { Navbar } from "@/components/navbar"
import * as React from "react"
import { MainCard } from "@/components/main-card"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
        <>
        <Navbar showLogout={false} />
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
            <LoginForm />
            </div>
        </div>
        </>
  )
}
