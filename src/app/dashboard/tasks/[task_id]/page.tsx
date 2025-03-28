import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Task } from '../columns'
import { Textarea } from '@/components/ui/textarea'
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Chat from '@/components/dashboard/Chat'
import { PieComponent } from '@/components/dashboard/chart-pie-label-custom'
import { SummaryDisplay } from '@/components/dashboard/SummaryDisplay'
import { DownloadButton } from '@/components/dashboard/DownloadButton'


async function getTask(task_id: string): Promise<Task | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('task_id', task_id)  // Changed from 'id' to 'task_id'
    .single()

  if (error) {
    console.error('Error fetching task:', error)
    return null
  }

  return data
}
 

interface SummaryData {
  status: string
  summary: Record<string, string[] | string>
}

async function getSummary(task_id: string): Promise<SummaryData | null> {
  try {
    // 首先获取任务信息
    const task = await getTask(task_id)
    if (!task) {
      throw new Error('Task not found')
    }

    // 根据任务类型选择不同的API端点
    const endpoint = task.type === 'User demand research' 
      ? '/api/demand_summary' 
      : '/api/feedback_summary'
    
    const response = await fetch(`http://localhost:5000${endpoint}?task_id=${task_id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch summary')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching summary:', error)
    return null
  }
}

export default async function TaskReport({
  params
}: {
  params: Promise<{ task_id: string }>
}) {
  const resolvedParams = await params
  const task = await getTask(resolvedParams.task_id)
  const summary = await getSummary(resolvedParams.task_id)

  if (!task) {
    return <div>Task not found</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-2 text-sm text-white/60 mb-6">
        <Link href="/dashboard/tasks" className="hover:text-white">
          Task Management
        </Link>
        <span>/</span>
        <span>Task Report</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white mb-4">Task Report</h1>
        {/* 这里添加任务报告的具体内容 */}
        <div className="bg-white/5 rounded-lg p-6">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <h2 className="text-white/60">Task Name</h2>
              <p className="text-white">{task.name}</p>
            </div>
            <div>
              <h2 className="text-white/60">User Portraits</h2>
              <p className="text-white">{task.user_portraits}</p>
            </div>
            <div>
              <h2 className="text-white/60">Product Portraits</h2>
              <p className="text-white">{task.product_portraits}</p>
            </div>
            <div>
              <h2 className="text-white/60">Task Type</h2>
              <p className="text-white">{task.type}</p>
            </div>
          </div>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-8 mt-6">
            <div className="bg-white/5 rounded-lg p-6">
              <div className="flex justify-between items-center mb-2">
                <Label className="text-white/60">Conversation summary</Label>
                <DownloadButton taskId={resolvedParams.task_id} />
              </div>
              <SummaryDisplay 
                summary={summary}
                loading={false}
                fallback="该任务暂无对话摘要"
              />
              <PieComponent />
            </div>
            <div className="bg-white/5 rounded-lg">
              <Chat summary={summary?.summary ? JSON.stringify(summary.summary) : undefined} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}