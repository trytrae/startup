import { Task, columns } from "./columns"
import { DataTable } from "./data-table"
import { createClient } from '@/utils/supabase/server'
import { checkAuth } from '../actions'

async function getData(): Promise<Task[]> {
  try {
    // First verify authentication using the checkAuth function
    await checkAuth()
    // console.log('Auth check passed')
    
    const supabase = await createClient()
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .order('create_at', { ascending: false })

    // console.log('Fetched tasks:', tasks)
    // console.log('Error if any:', error)

    if (error) {
      console.error('Error fetching tasks:', error)
      return []
    }

    return tasks || []
  } catch (e) {
    console.error('getData error:', e)
    return []
  }
}

export default async function DemoPage() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Task Management</h1>
        <p className="mt-1 text-white/60">
          Track your tasks
        </p>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  )
}
