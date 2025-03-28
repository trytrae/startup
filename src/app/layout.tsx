import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Oswald } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const oswald = Oswald({
  subsets: ['latin'],
  weight: ['700'],
  style: ['normal'],
})

export const metadata = {
  title: 'Convolens',
  description: 'Convolens',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body >
      <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            // enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
      </body>
    </html>
  )
}
