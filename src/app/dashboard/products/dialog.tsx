import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/utils/supabase/client"
import { useState } from "react"
import { Product } from "./columns"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from 'uuid'

export function DialogNewProduct({ product, mode = 'create' }: { product?: Product, mode?: 'create' | 'edit' }) {
    const supabase = createClient()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        product_id: product?.product_id || uuidv4(),  // 从 id 改为 product_id
        name: product?.name || '',
        image: product?.image || '',
        description: product?.description || ''
    })
    
    const handleSubmit = async () => {
        try {
            if (mode === 'edit' && product) {
                const { error } = await supabase
                    .from('products')
                    .update(formData)
                    .eq('product_id', product.product_id)  // 从 id 改为 product_id

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([formData])

                if (error) throw error
            }
            
            setFormData({
                product_id: uuidv4(),  // 从 id 改为 product_id
                name: '',
                image: '',
                description: ''
            })
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Error saving product:', error)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {mode === 'create' ? (
                    <Button>Add New</Button>
                ) : (
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit
                    </DropdownMenuItem>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Add New Product' : 'Edit Product'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create' ? 'Create new product here.' : 'Edit product details here.'} Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="name">Product Name</Label>
                        <Input 
                            id="name" 
                            className="col-span-3"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="image">Image URL</Label>
                        <Input 
                            id="image" 
                            className="col-span-3"
                            value={formData.image}
                            onChange={(e) => handleInputChange('image', e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                            id="description" 
                            placeholder="Product description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}