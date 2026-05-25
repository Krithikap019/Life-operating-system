import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/Providers"
import { initDB } from "@/lib/db"

initDB().catch(console.error)

export const metadata: Metadata = {
  title: "AI Life OS",
  description: "Your intelligent personal operating system",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

