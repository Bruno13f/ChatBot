"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import toast, { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter(); // Initialize the router

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorEmail(null);
    setErrorPassword(null);
    setLoading(true);

    // Email validation regex (basic check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setErrorEmail("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    // Password validation (check length)
    if (!password || password.length < 3) {
      setErrorPassword("Password must be at least 3 characters long.");
      setLoading(false);
      return;
    }

    try {
      if (!process.env.NEXT_PUBLIC_BACKEND_URI) {
        throw new Error("Backend URI is not defined");
      }
      const res = await fetch(`/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await res.json();
      // Store the token in localStorage (or cookies for more security)
      localStorage.setItem("token", data.token);
      toast.success("Logged in successfully!", {
        style: {
          borderRadius: "6px",
          background: "var(--card)",
          padding: "10px",
          border: "1px solid var(--border)",
          color: "var(--text)",
        },
      });
      localStorage.setItem("userId", data.userId); // Store userId in localStorage
      router.push(`/chatbot`);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Something went wrong.", {
        icon: "❌",
        style: {
          borderRadius: "6px",
          background: "var(--card)",
          padding: "10px",
          border: "1px solid var(--border)",
          color: "var(--text)",
        },
      });
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset error message when user interacts with input field
  const handleEmailFocus = () => {
    if (errorEmail) setErrorEmail(null); // Only reset error if the email has an error
  };

  const handlePasswordFocus = () => {
    if (errorPassword) setErrorPassword(null); // Only reset error if the password has an error
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} autoComplete="off" noValidate>
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
                <div className="text-sm text-red-500 -mt-2">
                  {errorPassword}
                </div>
              )}

              <Button type="submit" className="w-full">
                {loading ? (
                  <Loader2 className="animate-spin text-gray-500 w-6 h-6" />
                ) : (
                  "Login"
                )}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a
                href="#"
                className="underline underline-offset-4"
                onClick={(e) => {
                  e.preventDefault(); // Prevent default anchor link behavior
                  router.push("/sign-up"); // Redirect to the sign-up page
                }}>
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
