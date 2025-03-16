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

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"
import { useState } from "react"
import { Task } from "./columns"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from 'uuid'



export function DialogNewTask({ task, mode = 'create' }: { task?: Task, mode?: 'create' | 'edit' }) {
    const supabase = createClient()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        id: task?.id || uuidv4(),
        name: task?.name || '',
        type: task?.type || '' as Task['type'],
        user_portraits: task?.user_portraits || '',
        product_portraits: task?.product_portraits || '',
        status: task?.status || 'pending' as Task['status']
    })
    
    const handleSubmit = async () => {
        try {
            if (mode === 'edit' && task) {
                const { error } = await supabase
                    .from('tasks')
                    .update(formData)
                    .eq('id', task.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('tasks')
                    .insert([formData])

                if (error) throw error
            }
            
            // 清空表单并刷新页面
            setFormData({
                id: task?.id || uuidv4(),
                name: '',
                type: '' as Task['type'],
                user_portraits: '',
                product_portraits: '',
                status: 'pending'
            })
            setOpen(false)  // 关闭对话框
            router.refresh()
        } catch (error) {
            console.error('Error saving task:', error)
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
                    <DialogTitle>{mode === 'create' ? 'Add New Task' : 'Edit Task'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create' ? 'Create new task here.' : 'Edit task details here.'} Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="name">Task Name</Label>
                        <Input 
                            id="name" 
                            className="col-span-3"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="type">Task Type</Label>
                        <Select 
                            value={formData.type} // 添加这行
                            onValueChange={(value) => handleInputChange('type', value)}
                        >
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectItem value="User demand research">User demand research</SelectItem>
                                <SelectItem value="Product proof-of-concept research">Product proof-of-concept research</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="user_portraits">User Portraits</Label>
                        <Input 
                            id="user_portraits" 
                            className="col-span-3"
                            value={formData.user_portraits}
                            onChange={(e) => handleInputChange('user_portraits', e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="product_portraits">Product Portraits</Label>
                        <Textarea 
                            id="product_portraits" 
                            placeholder="Product portraits details"
                            value={formData.product_portraits}
                            onChange={(e) => handleInputChange('product_portraits', e.target.value)}
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



