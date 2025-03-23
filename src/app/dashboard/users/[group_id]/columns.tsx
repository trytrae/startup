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
import { DialogNewUser } from "./dialog"  // 在users的相关文件中
import { createClient } from '@/utils/supabase/client'
import { useRouter } from "next/navigation"
import { useState } from 'react'


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
 
 
export type User = {
  user_id: string
  group_id: string  // 添加这个字段
  city: string
  occupation: string
  child_age: number
  lifestyle: string
  annual_clothing_spend: number  // Changed from annualClothingSpend to match DB schema
  purchase_history1: string
  purchase_history2: string
  purchase_history3: string
  created_at: string
}

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "user_id",
    header: "User ID",
    cell: ({ row }) => {
      const value = row.getValue("user_id") as string
      return <div className="min-w-[100px] w-full truncate">{value}</div>
    }
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => {
      const value = row.getValue("city") as string
      return <div className="min-w-[100px] w-full truncate">{value}</div>
    }
  },
  {
    accessorKey: "occupation",
    header: "Occupation",
    cell: ({ row }) => {
      const value = row.getValue("occupation") as string
      return <div className="min-w-[100px] w-full truncate">{value}</div>
    }
  },
  {
    accessorKey: "child_age",
    header: "Child Age",
    cell: ({ row }) => {
      const value = row.getValue("child_age") as number
      return <div className="min-w-[80px] w-full truncate">{value}</div>
    }
  },
  {
    accessorKey: "lifestyle",
    header: "Lifestyle",
    cell: ({ row }) => {
      const value = row.getValue("lifestyle") as string
      return <div className="min-w-[120px] w-full truncate">{value}</div>
    }
  },
  {
    accessorKey: "annual_clothing_spend",  // Changed to match the new name
    header: "Annual Clothing Spend (¥)",
    cell: ({ row }) => {
      const value = row.getValue("annual_clothing_spend") as number  // Changed here too
      return (
        <div className="min-w-[120px] w-full truncate text-right">
          {value ? `¥${value.toLocaleString()}` : '-'}
        </div>
      )
    }
  },
  {
    accessorKey: "purchase_history1",
    header: "Purchase History 1",
    cell: ({ row }) => {
      const value = row.getValue("purchase_history1") as string
      return <div className="min-w-[200px] w-full truncate">{value}</div>
    }
  },
  {
    accessorKey: "purchase_history2",
    header: "Purchase History 2",
    cell: ({ row }) => {
      const value = row.getValue("purchase_history2") as string
      return <div className="min-w-[200px] w-full truncate">{value}</div>
    }
  },
  {
    accessorKey: "purchase_history3",
    header: "Purchase History 3",
    cell: ({ row }) => {
      const value = row.getValue("purchase_history3") as string
      return <div className="min-w-[200px] w-full truncate">{value}</div>
    }
  },
   
  {
    accessorKey: "created_at", 
    header: ({ column }) => {
        return (
          <Label 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Create At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Label>
        )
      },
  }, 
//   {
//     accessorKey: "amount",
//     header: () => <div className="text-right">Amount</div>,
//     cell: ({ row }) => {
//       const amount = parseFloat(row.getValue("amount"))
//       const formatted = new Intl.NumberFormat("en-US", {
//         style: "currency",
//         currency: "USD",
//       }).format(amount)
 
//       return <div className="text-right font-medium">{formatted}</div>
//     },
//   },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
      const router = useRouter()
      
      const handleDelete = async () => {
        try {
          const supabase = createClient() 
          const { error } = await supabase
            .from('users')
            .delete()
            .eq('user_id', user.user_id)

          if (error) throw error
          
          router.refresh()
        } catch (error) {
          console.error('Error deleting user:', error)
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
 
            >
              Check Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DialogNewUser user={user} mode="edit" />
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
