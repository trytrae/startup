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
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

export type Task = {
    id: string
    name: string
    type: "User demand research" | "Product proof-of-concept research" 
    user_portraits: string
    product_portraits: string
    status: "pending" | "processing" | "success" | "failed"
    create_at: string
  }

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "id",
    header: "Task Id",
  },
  {
    accessorKey: "name",
    header: "Task Name",
  },
  {
    accessorKey: "type",
    header: "Task Type",
  },
  {
    accessorKey: "user_portraits",
    header: "User Portraits",
  },
  {
    accessorKey: "product_portraits",
    header: "Product Portraits",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "create_at", 
    header: ({ column }) => {
        return (
          <Label 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <p>Create At</p>
            <ArrowUpDown className="  h-4 w-4" />
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
      const task = row.original
      const router = useRouter()
      
      const handleDelete = async () => {
        try {
          const supabase = createClient()
          const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', task.id)

          if (error) throw error
          
          // 刷新页面以更新数据
          router.refresh()
        } catch (error) {
          console.error('Error deleting task:', error)
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
              onClick={() => navigator.clipboard.writeText(task.id)}
            >
              Task Report
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit</DropdownMenuItem>
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
