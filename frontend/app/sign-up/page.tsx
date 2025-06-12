import { Navbar } from "@/components/navbar"
import { SignUpForm } from "@/components/signup-form"

export default function SignUpPage() {
return (
        <div className="flex min-h-svh w-full items-center justify-center px-6 pb-6 md:p-10">
            <div className="w-full max-w-sm">
            <div className="mb-6 text-center">
                <h1 className="text-4xl font-semibold">Chatbot</h1>
            </div>
                <SignUpForm />
            </div>
        </div>
    )
}
  
