import { UserGroup, groupColumns } from "./columns"
import { DataTable } from "./data-table"
import { createClient } from '@/utils/supabase/server'
import { checkAuth } from '../actions'

async function getData(): Promise<UserGroup[]> {
  try {
    await checkAuth()
    
    const supabase = await createClient()
    const { data: usergroups, error } = await supabase
      .from('usergroup')  // 改为 usergroup 表
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching usergroups:', error)
      return []
    }

    return usergroups || []
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
        <h1 className="text-2xl font-bold text-white">User Groups Management</h1>
        <p className="mt-1 text-white/60">
          Track user groups
        </p>
      </div>

      <DataTable columns={groupColumns} data={data} />
    </div>
  )
}
