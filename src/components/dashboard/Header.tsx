'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Oswald } from 'next/font/google'
import { signOut, getCurrentUser, fetchHealthCheck } from './actions'
import { Label } from '../ui/label'

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['700'],
  style: ['normal'],
})

interface User {
  id: string
  email: string 
}

export default function Header() {
  const [user, setUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser() // 打印 userData 以检查其值
        if (userData) {
          setUser(userData)
        }
      } catch (error) {
        console.error('Error:', error)
        setError('Error loading user data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])  
  // Loading state 保持不变
  if (isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="animate-pulse bg-white/5 h-8 w-24 rounded"></div>
            <div className="animate-pulse bg-white/5 h-8 w-32 rounded"></div>
          </div>
        </div>
      </header>
    )
  }

  // const fetchHealthCheck = async () => {
  //   console.log('开始请求健康检查接口...');  // 调试日志
  //   try {
  //     const response = await fetch('http://localhost:5000/api/health');
  //     console.log('收到响应:', response);  // 调试日志
  //     const data = await response.json();
  //     console.log('解析后的数据:', data);  // 调试日志
  //   } catch (error) {
  //     console.error('请求出错:', error);
  //   }
  // };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center">
              <span className={`text-[#FFBE1A] font-bold text-xl tracking-wider ${oswald.className}`}>ConvoLens</span>
              <span className="mx-2 text-white/40">|</span>
              <span className="text-white/60 text-sm font-light italic">Illuminating Insights Through Consumer Conversations</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              <div className="text-white/60">
                User: 
              </div>
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-white hover:text-white/80"
                >
                  <span>{user?.email}</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {/* <Link
                        href="/dashboard/tasks"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Label
                        // href="/dashboard/tasks"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={(e) => {e.preventDefault();  // 防止立即跳转
                          setIsMenuOpen(false);
                          fetchHealthCheck();}}
                      >
                        Tasks
                      </Label> */}
    
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          signOut()
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}