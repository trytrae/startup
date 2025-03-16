'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login, signup } from './actions'

interface AuthFormProps {
  view?: string
}

export default function AuthForm({ view: initialView }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(initialView === 'sign-up')
  const [error, setError] = useState<string | null>(null)
  
  const searchParams = useSearchParams()
  const returnUrl = searchParams?.get('returnUrl') || '/'

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full px-4">
      <div className="w-full max-w-sm space-y-6">
        <h2 className="text-2xl font-semibold text-white text-center">
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <form action={isSignUp ? signup : login} className="space-y-4">
          {/* 表单内容保持不变，但移除 onChange 处理器 */}
          <div className="space-y-4">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FFBE1A] focus:border-transparent"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FFBE1A] focus:border-transparent"
                placeholder="Password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-[#FFBE1A] text-black rounded-lg font-medium hover:bg-[#FFBE1A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFBE1A] disabled:opacity-50 transition-colors"
          >
            {isSignUp ? 'Sign up' : 'Sign in'}
          </button>

          <div className="text-center">
            <Link
              href={isSignUp ? '/auth' : '/auth?view=sign-up'}
              className="text-[#FFBE1A] hover:text-[#FFBE1A]/80 text-sm font-medium"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}