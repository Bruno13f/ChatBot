"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import toast, { Toaster } from 'react-hot-toast';

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorEmail, setErrorEmail] = useState<string | null>(null)
  const [errorPassword, setErrorPassword] = useState<string | null>(null)
  const [errorConfirmPassword, setErrorConfirmPassword] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Handle login form submission
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorEmail(null)
    setErrorPassword(null)
    setLoading(true)

    // Email validation regex (basic check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      setErrorEmail("Please enter a valid email address.")
      setLoading(false)
      return
    }

    // Password validation (check length)
    if (!password || password.length < 3) {
      setErrorPassword("Password must be at least 3 characters long.")
      setLoading(false)
      return
    }

    if (!confirmPassword || confirmPassword.length < 3 ) {
      setErrorConfirmPassword("Password must be at least 3 characters long.")
      setLoading(false)
      return
    }else if (confirmPassword != password) {
      setErrorConfirmPassword("Passwords must match")
      setErrorPassword("Passwords must match")
      setLoading(false)
      return
    }

    try {
      if (!process.env.NEXT_PUBLIC_BACKEND_URI) {
        throw new Error('Backend URI is not defined');
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error('Error creating account.');
      }
      
      toast.success('Account created successfully!', {
        style: {
          borderRadius: '6px',
          background: 'var(--card)',
          padding: '10px',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        },
      })

      await toast.promise( 
        logginIn(email, password), {
          loading: 'Logging in...',
          success: <b>Logged in successfully!</b>,
          error: <b>Failed to log in!</b>,
      },{
        style: {
          borderRadius: '6px',
          background: 'var(--card)',
          padding: '10px',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        },
      })

    } catch (error) {
      toast((error instanceof Error ? error.message : "Something went wrong."), {
        icon: '❌',
        style: {
          borderRadius: '6px',
          background: 'var(--card)',
          padding: '10px',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        },
      });
      console.error('Sign-up error:', error);
    } finally {
      setLoading(false);
    }
  }

  const logginIn = async (email: string, password: string) => {
    try {

      if (!process.env.NEXT_PUBLIC_BACKEND_URI) {
        throw new Error('Backend URI is not defined');
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        return false
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId); // Store userId in localStorage
      router.push(`/chatbot`);
      return true
    } catch (error) { 
      return false
    }
  }

  // Reset error message when user interacts with input field
  const handleEmailFocus = () => {
    if (errorEmail) setErrorEmail(null) // Only reset error if the email has an error
  }

  const handlePasswordFocus = () => {
    if (errorPassword) setErrorPassword(null) // Only reset error if the password has an error
  }

  const handleConfirmPassword = () => {
    if (errorConfirmPassword) setErrorConfirmPassword(null) // Only reset error if the password has an error
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
        <CardTitle className="text-2xl">
            Sign Up
          </CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} autoComplete="off" noValidate>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={handleEmailFocus} // Reset error on focus
                  aria-invalid={!!errorEmail && !email}
                  className={cn(errorEmail ? "border-red-500" : "")} // Apply red border if errorEmail exists
                />
              </div>

              {errorEmail && (
                <div className="text-sm text-red-500 -mt-2">{errorEmail}</div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handlePasswordFocus} // Reset error on focus
                  aria-invalid={!!errorPassword && password.length < 3}
                  className={cn(errorPassword ? "border-red-500" : "")} // Apply red border if errorPassword exists
                />
              </div>

              {errorPassword && (
                <div className="text-sm text-red-500 -mt-2">{errorPassword}</div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={handleConfirmPassword} // Reset error on focus
                  aria-invalid={!!errorConfirmPassword && (confirmPassword.length < 3 || confirmPassword != password)}
                  className={cn(errorConfirmPassword ? "border-red-500" : "")}
                />
              </div>

              {errorConfirmPassword && (
                <div className="text-sm text-red-500 -mt-2">{errorConfirmPassword}</div>
              )}

              <Button type="submit" className="w-full">
                {loading ? <Loader2 className="animate-spin text-gray-500 w-6 h-6" /> : 'Sign Up'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a
                href="#"
                className="underline underline-offset-4"
                onClick={(e) => {
                  e.preventDefault(); // Prevent default anchor link behavior
                  router.push('/login'); // Redirect to the sign-up page
                }}
              >
                Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
