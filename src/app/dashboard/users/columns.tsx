"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { DialogNewUserGroup } from "./dialog"  // 在users的相关文件中
import { createClient } from '@/utils/supabase/client'
import { useRouter } from "next/navigation"
import { useState } from 'react'


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
 
  

export type UserGroup = {
  group_id: string
  group_name: string
  user_amount: number
  created_at: string
}

export const groupColumns: ColumnDef<UserGroup>[] = [
  // {
  //   accessorKey: "group_id",
  //   header: "Group ID",
  //   cell: ({ row }) => {
  //     const value = row.getValue("group_id") as string
  //     return <div className="min-w-[100px] w-full truncate">{value}</div>
  //   }
  // },
  {
    accessorKey: "group_name",
    header: "Group Name",
    cell: ({ row }) => {
      const value = row.getValue("group_name") as string
      return <div className="min-w-[150px] w-full truncate">{value}</div>
    }
  },
  {
    accessorKey: "user_amount",
    header: "User Amount",
    cell: ({ row }) => {
      const value = row.getValue("user_amount") as number
      return <div className="min-w-[100px] w-full truncate ">{value}</div>
    }
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Label 
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Label>
      )
    },
    cell: ({ row }) => {
      const value = row.getValue("created_at") as string
      return <div className="min-w-[120px] w-full truncate">{value}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const group = row.original
      return <ActionCell group={group} />
    }
  }
]

// Create a component for the actions cell to properly use hooks
function ActionCell({ group }: { group: UserGroup }) {
  const router = useRouter()
      
  const handleDelete = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('usergroup')
        .delete()
        .eq('group_id', group.group_id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Error deleting group:', error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Label className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Label>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => {
            router.push(`/dashboard/users/${group.group_id}`)
          }}
        >
          Check Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DialogNewUserGroup group={group} mode="edit" />
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-red-600 focus:text-red-600"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )}