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
import { group } from "console"
import { useToast } from "@/hooks/use-toast"



export function DialogNewTask({ task, mode = 'create' }: { task?: Task, mode?: 'create' | 'edit' }) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    // 将 supabase 客户端创建移到 useEffect 外部并使用 useMemo
    const supabase = React.useMemo(() => createClient(), []);
    const router = useRouter()
    const [open, setOpen] = useState(false)
    // 添加新的状态
    const [users, setUsers] = useState<Array<{ group_id: string; group_name: string }>>([])
    const [products, setProducts] = useState<Array<{ product_id: string; name: string }>>([])
    
    // 添加对话框打开时的监听
    React.useEffect(() => {
        if (open && mode === 'create') {
            setFormData({
                task_id: uuidv4(),
                name: '',
                type: '' as Task['type'],
                user_portraits: '',
                product_portraits: '',
                status: 'pending',
                group_id: '',
                product_id: '',
            })
        }
    }, [open, mode])
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
                    .select('product_id, name')
                if (productError) throw productError
                setProducts(productData || [])
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }

        fetchData()
    }, [supabase])
    const [formData, setFormData] = useState({
        task_id: task?.task_id || uuidv4(),  // 从 id 改为 task_id
        name: task?.name || '',
        type: task?.type || '' as Task['type'],
        user_portraits: task?.user_portraits || '',
        product_portraits: task?.product_portraits || '',
        status: task?.status || 'pending' as Task['status'],
        group_id: task?.group_id || '',
        product_id: task?.product_id || '',
    })
    
    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            // Prepare the data before saving
            const dataToSave = {
                ...formData,
                // For User demand research, we'll set a default value for product_id
                product_id: formData.type === 'User demand research' ? null : formData.product_id,
                product_portraits: formData.type === 'User demand research' ? '--' : formData.product_portraits
            };
            // Save to Supabase
            if (mode === 'edit' && task) {
                const { error } = await supabase
                    .from('tasks')
                    .update(dataToSave)
                    .eq('task_id', task.task_id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('tasks')
                    .insert([dataToSave])

                if (error) throw error
            }

            toast({
                title: "Task Created",
                description: "Waiting for AI processing, this may take a few minutes...",
            })

            // 发送数据到 Flask 后端
            const apiUrl = formData.type === 'User demand research' 
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user_demand`
                : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jeans-feedback`;
                
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    task_id: formData.task_id,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send data to backend');
            }

            toast({
                title: "Processing Complete",
                description: "AI analysis has been completed",
                variant: "default",
            })

            // 清空表单并刷新页面
            setFormData({
                task_id: task?.task_id || uuidv4(),  // 从 id 改为 task_id
                name: '',
                type: '' as Task['type'],
                user_portraits: '',
                product_portraits: '',
                status: 'pending',
                group_id: '',
                product_id: '',
            })
            setOpen(false)  // 关闭对话框
            router.refresh()
        } catch (error) {
            console.error('Error saving task:', error)
            toast({
                title: "Error",
                description: "An error occurred while saving the task",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
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
                            value={formData.type}
                            onValueChange={(value) => {
                                handleInputChange('type', value);
                                // 当选择 User demand research 时，设置默认值
                                if (value === 'User demand research') {
                                    handleInputChange('product_portraits', '--');
                                    handleInputChange('product_id', '');
                                }
                            }}
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
                            onValueChange={(value) => {
                                // 找到对应的用户数据
                                const selectedUser = users.find(user => user.group_name === value);
                                if (selectedUser) {
                                    // 同时更新 user_portraits 和 group_id
                                    handleInputChange('user_portraits', value);
                                    handleInputChange('group_id', selectedUser.group_id);
                                }
                            }}
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

                    {formData.type !== 'User demand research' &&(<div className="flex flex-col space-y-1.5">
                        <Label htmlFor="product_portraits">Product Portraits</Label>
                        <Select 
                            value={formData.product_portraits}
                            onValueChange={(value) => {
                                // 找到对应的产品数据
                                const selectedProduct = products.find(product => product.name === value);
                                if (selectedProduct) {
                                    // 同时更新 product_portraits 和 product_id
                                    handleInputChange('product_portraits', value);
                                    handleInputChange('product_id', selectedProduct.product_id);
                                }
                            }}
                        >
                            <SelectTrigger id="product_portraits">
                                <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map(product => (
                                    <SelectItem key={product.product_id} value={product.name}>
                                        {product.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>)}
                </div>
                <DialogFooter>
                    <Button 
                        type="submit" 
                        onClick={handleSubmit} 
                        disabled={isLoading}
                    >
                        {isLoading ? "处理中..." : "保存"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}



