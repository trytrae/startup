import { User, columns } from "./columns"
import { DataTable } from "./data-table"
import { createClient } from '@/utils/supabase/server'
import { checkAuth } from '../actions'

async function getData(): Promise<User[]> {
  try {
    // 验证用户身份
    await checkAuth()
    
    const supabase = await createClient()
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('create_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return []
    }

    return users || []
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
        <h1 className="text-2xl font-bold text-white">User Portraits Management</h1>
        <p className="mt-1 text-white/60">
          Track user portraits
        </p>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  )
}
