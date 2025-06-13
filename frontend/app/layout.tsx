import { Inter } from "next/font/google"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/ui/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({subsets: ['latin'], variable: "--font-inter"})

export const metadata:Metadata = {
  title: "ChatBot",
  description: "Users can generate jokes or weather predictions and engage in lively conversations about them."
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
