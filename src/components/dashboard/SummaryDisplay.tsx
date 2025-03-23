'use client'

import { useEffect, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from "@/components/ui/skeleton"

interface SummaryData {
  status: string
  summary: Record<string, string[] | string>
}

export function SummaryDisplay({ taskId }: { taskId: string }) {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<SummaryData | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/summary?task_id=${taskId}`)
        const data = await response.json()
        setSummary(data)
      } catch (error) {
        console.error('Error fetching summary:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [taskId])

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
    return <Textarea placeholder="无法加载摘要数据" disabled />
  }

  const summaryText = Object.entries(summary.summary)
    .map(([key, value]) => {
      const content = Array.isArray(value) ? value.join('\n') : value
      return `${key}：\n${content}`
    })
    .join('\n\n')

  return <Textarea value={summaryText} className="min-h-[200px]" disabled />
}