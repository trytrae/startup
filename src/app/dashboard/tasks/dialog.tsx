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



export function DialogNewTask() {
    const supabase = createClient()
    const [formData, setFormData] = useState({
        name: '',
        type: '' as Task['type'],
        user_portraits: '',
        product_portraits: '',
        status: 'pending' as Task['status']
    })

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async () => {
        try {
            const { error } = await supabase
                .from('tasks')
                .insert([formData])

            if (error) throw error
            
            // 清空表单
            setFormData({
                name: '',
                type: '' as Task['type'],
                user_portraits: '',
                product_portraits: '',
                status: 'pending'
            })
        } catch (error) {
            console.error('Error saving task:', error)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Add New</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                    <DialogDescription>
                        Create new task here. Click save when you're done.
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
                        <Select onValueChange={(value) => handleInputChange('type', value)}>
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



