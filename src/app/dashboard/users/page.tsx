"use client"

import { User, UserGroup, groupColumns, userColumns } from "./columns"
import { DataTable } from "./data-table"
import { createClient } from '@/utils/supabase/client'
import { checkAuth } from '../actions'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"


function DemoPage() {
  const [data, setData] = useState<UserGroup[]>([])
  const [userData, setUserData] = useState<User[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  const handleShowUsers = (groupId: string) => {
    setSelectedGroupId(groupId === selectedGroupId ? null : groupId)
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()
        const { data: usergroups, error } = await supabase
          .from('usergroup')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setData(usergroups || [])
      } catch (e) {
        console.error('getData error:', e)
        setData([])
      }
    }

    fetchData()
  }, [])


  useEffect(() => {
    async function fetchUserData() {
      if (!selectedGroupId) {
        setUserData([])
        return
      }

      try {
        const supabase = createClient()
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .eq('group_id', selectedGroupId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setUserData(users || [])
      } catch (e) {
        console.error('Error fetching users:', e)
        setUserData([])
      }
    }

    fetchUserData()
  }, [selectedGroupId])

  return (
    <div className="container mx-auto py-10">
      <div>
        <h1 className="text-2xl font-bold text-white">User Groups Management</h1>
        <p className="mt-1 text-white/60">
          Track user groups
        </p>
      </div>

      <DataTable columns={groupColumns(handleShowUsers)} data={data} />

      {selectedGroupId && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Group Users</h2>
          <DataTable columns={userColumns} data={userData} />
          <Button onClick={() => {
            // TODO: 实现Excel导入功能
            console.log('Import Excel clicked')
          }}>
            Import Excel
          </Button>
        </div>
      )}

    </div>
  )
}

export default DemoPage
