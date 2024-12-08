import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import NavBar from '../components/NavBar';
import chat from '../components/Chat'
import StoreProvider from './StoreProvider';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Fin',
  description: 'Created by flixee',
}

export default function RootLayout({ children }) {
  return (
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
  )
}
