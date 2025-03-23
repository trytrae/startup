import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Task } from '../columns'
import { Textarea } from '@/components/ui/textarea'
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Chat from '@/components/dashboard/Chat'
import { PieComponent } from '@/components/dashboard/chart-pie-label-custom'


async function getTask(id: string): Promise<Task | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('task_id', id)  // Changed from 'id' to 'task_id'
    .single()

  if (error) {
    console.error('Error fetching task:', error)
    return null
  }

  return data
}

export default async function TaskReport({ 
  params 
}: { 
  params: Promise<{ task_id: string }> 
}) {
  const resolvedParams = await params
  const task = await getTask(resolvedParams.task_id)

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
            {/* 添加更多任务详情 */}
          </div>
        </div>
        <div>
        <div className="grid grid-cols-2 gap-8 mt-6">
              <div className="bg-white/5 rounded-lg p-6">
                <div className="flex justify-between items-center mb-2">
                    <Label className="text-white/60">Conversation summary</Label>
                    <Button>Download whole conversation</Button>
                </div>
                <Textarea placeholder="Type your message here." disabled />
                <PieComponent/>
                {/* <词云图/> */}
              </div>
              <div className="bg-white/5 rounded-lg">
                <Chat />
              </div>
            </div>
        </div>

      </div>
    </div>
  )
}