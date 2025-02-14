import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import StoreProvider from './StoreProvider';
import {SessionProvider} from 'next-auth/react'


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Fin',
  description: 'Created by flixee',
}

export default function RootLayout({ children }) {
  return (
    <SessionProvider>
    <html lang="en">
      <body className={inter.className}>
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        <StoreProvider>
        {children}
        </StoreProvider>
      <Toaster />
      </ThemeProvider>
      </body>
    </html>
    </SessionProvider>
  )
}
