import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "AI Ethics Reflection Tool | Covenant of Humanistic Technologies",
  description:
    "Reflect on your relationship with technology. Let AI help you craft a personal covenant — a pledge for a more human future.",
  openGraph: {
    title: "AI Ethics Reflection Tool | Covenant of Humanistic Technologies",
    description:
      "Reflect on your relationship with technology. Let AI help you craft a personal covenant — a pledge for a more human future.",
    type: "website",
    url: "https://manifest.human.tech",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
