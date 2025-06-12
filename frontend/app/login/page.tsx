import { Navbar } from "@/components/navbar"
import * as React from "react"
import { MainCard } from "@/components/main-card"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center px-6 pb-20 md:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-semibold">Chatbot</h1>
        </div>
          <LoginForm />
      </div>
    </div>
  )
}
