'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import { DataTable } from './data-table'
import {User, userColumns } from './columns'
import Link from 'next/link'

export default function GroupUsers({ params }: { params: { group_id: string } }) {
  const resolvedParams = use(params)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [groupName, setGroupName] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('group_id', resolvedParams.group_id)

        if (error) throw error
        setUsers(data || [])

        const { data: groupData, error: groupError } = await supabase
          .from('usergroup')
          .select('group_name')
          .eq('group_id', resolvedParams.group_id)
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
  }, [resolvedParams.group_id])

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