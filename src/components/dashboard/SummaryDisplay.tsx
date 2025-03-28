'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from "@/components/ui/skeleton"

interface SummaryData {
  status: string
  summary: Record<string, string[] | string>
}

export function SummaryDisplay({ 
  summary,
  loading = false,
  fallback = "暂无摘要数据"
}: { 
  summary: SummaryData | null
  loading?: boolean
  fallback?: string 
}) {
  // 移除了useEffect和fetch逻辑

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-[20px] w-[80%]" />
        <Skeleton className="h-[20px] w-[70%]" />
        <Skeleton className="h-[20px] w-[60%]" />
      </div>
    )
  }

  if (!summary) {
    return <Textarea placeholder={fallback} disabled />
  }

  const summaryText = Object.entries(summary.summary)
    .map(([key, value]) => {
      const content = Array.isArray(value) ? value.join('\n') : value
      return `${key}：\n${content}`
    })
    .join('\n\n')

  return <Textarea value={summaryText} className="min-h-[200px]" disabled />
}