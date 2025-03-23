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
 
import { DialogNewProduct } from "./dialog"  // 在products的相关文件中
import { createClient } from '@/utils/supabase/client'
import { useRouter } from "next/navigation"

 
export type Product = {
    product_id: string  // 从 id 改为 product_id
    name: string
    image: string
    description: string
    create_at: string
  }

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "product_id",  // 从 id 改为 product_id
    header: "Product Id",
    cell: ({ row }) => {
      const value = row.getValue("product_id") as string  // 从 id 改为 product_id
      return <div className="min-w-[100px] w-full truncate">{value}</div>
    }
  },
  {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => {
      const value = row.getValue("name") as string
      return <div className="min-w-[100px] w-full truncate">{value}</div>
    }
  },
  {
    accessorKey: "image",
    header: "Product Image",
    cell: ({ row }) => {
      const value = row.getValue("image") as string
      return <div className="min-w-[100px] w-full truncate">{value}</div>
    }
  },
  {
    accessorKey: "description",
    header: "Product Description",
    cell: ({ row }) => {
      const value = row.getValue("description") as string
      return <div className="min-w-[100px] w-full truncate">{value}</div>
    }
  },  
  {
    accessorKey: "create_at", 
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
      const product = row.original
      const router = useRouter()
      
      const handleDelete = async () => {
        try {
          const supabase = await createClient()
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('product_id', product.product_id)  // 从 id 改为 product_id

          if (error) throw error
          
          router.refresh()
        } catch (error) {
          console.error('Error deleting product:', error)
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
              onClick={() => navigator.clipboard.writeText(product.product_id)}  // 从 id 改为 product_id
            >
              Check Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DialogNewProduct product={product} mode="edit" />
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
