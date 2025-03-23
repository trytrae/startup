'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  HomeIcon,
  ChartBarIcon,
  UserCircleIcon,
  DocumentTextIcon,
  CubeIcon,
} from '@heroicons/react/24/outline'
import Header from '@/components/dashboard/Header'
import { checkAuth } from './actions'

interface NavItem {
  name: string
  href: string
  icon: typeof HomeIcon
}

const navigation: NavItem[] = [
  // { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  // { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Tasks', href: '/dashboard/tasks', icon: DocumentTextIcon },
  
  { name: 'User Portraits', href: '/dashboard/users', icon: UserCircleIcon },
  { name: 'Product Portraits', href: '/dashboard/products', icon: CubeIcon },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const init = async () => {
      try {
        await checkAuth()
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="flex h-[calc(100vh-4rem)] pt-16">
        {/* Sidebar 部分保持不变 */}
        <div className="fixed left-0 w-64 h-[calc(100vh-4rem)] bg-[#111111] border-r border-white/5 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="ml-64 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}