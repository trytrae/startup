'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Oswald } from 'next/font/google'
import AuthForm from './AuthForm'
import Link from 'next/link'
import Image from 'next/image'

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['700'],
  style: ['normal'],
})

function AuthContent() {
  const searchParams = useSearchParams()
  const [view, setView] = useState('sign-in')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const viewParam = searchParams.get('view')
    if (viewParam) {
      setView(viewParam)
    }
  }, [searchParams])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.svg" alt="Logo" width={32} height={32} priority />
              <span className={`text-[#FFBE1A] font-bold text-xl italic ${oswald.className} transform skew-x-[-12deg]`}>ConvoLens</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              {/* <Link href="/features" className="text-white/60 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/docs" className="text-white/60 hover:text-white transition-colors">
                Documentation
              </Link> */}
              <Link 
                href={view === 'sign-in' ? '/auth?view=sign-up' : '/auth?view=sign-in'} 
                className="text-[#FFBE1A] hover:text-[#FFBE1A]/80 transition-colors"
              >
                {view === 'sign-in' ? 'Sign up' : 'Sign in'}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col pt-20">
        <AuthForm view={view} />
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
}