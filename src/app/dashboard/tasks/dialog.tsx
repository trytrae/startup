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
    // 添加新的状态
    const [users, setUsers] = useState<Array<{ group_id: string; group_name: string }>>([])
    const [products, setProducts] = useState<Array<{ id: string; name: string }>>([])
    
    // 添加数据获取函数
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // 获取用户数据
                const { data: userData, error: userError } = await supabase
                    .from('usergroup')
                    .select('group_id, group_name')
                if (userError) throw userError
                setUsers(userData || [])

                // 获取产品数据
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .select('id, name')
                if (productError) throw productError
                setProducts(productData || [])
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }

        fetchData()
    }, [])
    const [formData, setFormData] = useState({
        task_id: task?.task_id || uuidv4(),  // 从 id 改为 task_id
        name: task?.name || '',
        type: task?.type || '' as Task['type'],
        user_portraits: task?.user_portraits || '',
        product_portraits: task?.product_portraits || '',
        status: task?.status || 'pending' as Task['status']
    })
    
    const handleSubmit = async () => {
        try {
            // 首先保存到 Supabase
            if (mode === 'edit' && task) {
                const { error } = await supabase
                    .from('tasks')
                    .update(formData)
                    .eq('task_id', task.task_id)  // 从 id 改为 task_id

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('tasks')
                    .insert([formData])

                if (error) throw error
            }

            // 发送数据到 Flask 后端
            const response = await fetch('http://localhost:5000/api/jeans-feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    task_id: formData.task_id,
                    user_portraits: formData.user_portraits,
                    product_portraits: formData.product_portraits,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send data to backend');
            }

            // 清空表单并刷新页面
            setFormData({
                task_id: task?.task_id || uuidv4(),  // 从 id 改为 task_id
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
                        <Select 
                            value={formData.user_portraits}
                            onValueChange={(value) => handleInputChange('user_portraits', value)}
                        >
                            <SelectTrigger id="user_portraits">
                                <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map(user => (
                                    <SelectItem key={user.group_id} value={user.group_name}>
                                        {user.group_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="product_portraits">Product Portraits</Label>
                        <Select 
                            value={formData.product_portraits}
                            onValueChange={(value) => handleInputChange('product_portraits', value)}
                        >
                            <SelectTrigger id="product_portraits">
                                <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map(product => (
                                    <SelectItem key={product.id} value={product.name}>
                                        {product.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}



