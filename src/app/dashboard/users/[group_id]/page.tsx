'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { DataTable } from './data-table'
import {User, userColumns } from './columns'
import Link from 'next/link'

// 修改组件定义，使用正确的 Next.js App Router 页面参数类型
type Props = {
  params: { group_id: string }
}

export default function GroupUsers({ params }: Props) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [groupName, setGroupName] = useState('')
  const supabase = useMemo(() => createClient(), []);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('group_id', params.group_id)

        if (error) throw error
        setUsers(data || [])

        const { data: groupData, error: groupError } = await supabase
          .from('usergroup')
          .select('group_name')
          .eq('group_id', params.group_id)
          .single()

        if (groupError) throw groupError
        setGroupName(groupData?.group_name || '')

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.group_id, supabase])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-white/60 mb-6">
        <Link href="/dashboard/users" className="hover:text-white">
          User Groups
        </Link>
        <span>/</span>
        <span>Group: {groupName}</span>
      </div> 
      <DataTable columns={userColumns} data={users}  />
    </div>
  )
}