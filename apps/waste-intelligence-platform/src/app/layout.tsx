import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { Sidebar } from '@/components/layout/sidebar'
import { Toaster } from '@/components/ui/toaster'
import { CompaniesProvider } from '@/contexts/companies-context'
import { KPIProvider } from '@/contexts/kpi-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Waste Intelligence Platform',
  description: 'Professional waste management intelligence and analytics platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CompaniesProvider>
          <KPIProvider>
            <div className="min-h-screen flex bg-gray-50">
              <Sidebar />
              <main className="flex-1 lg:ml-64">
                {children}
              </main>
            </div>
            <Toaster />
          </KPIProvider>
        </CompaniesProvider>
      </body>
    </html>
  )
}