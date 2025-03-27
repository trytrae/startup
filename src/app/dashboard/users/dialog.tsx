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
import { createClient } from "@/utils/supabase/client"
import { useState } from "react" 
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from 'uuid'
import { UserGroup } from "./columns"

 

export function DialogNewUserGroup({ group, mode = 'create' }: { group?: UserGroup, mode?: 'create' | 'edit' }) {
    const supabase = createClient()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        group_id: group?.group_id || uuidv4(),
        group_name: group?.group_name || '',
        user_amount: group?.user_amount || 0,
    })
    
    const handleSubmit = async () => {
        try {
            if (mode === 'edit' && group) {
                const { error } = await supabase
                    .from('usergroup')
                    .update(formData)
                    .eq('group_id', group.group_id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('usergroup')
                    .insert([formData])

                if (error) throw error
            }
            
            setFormData({
                group_id: group?.group_id || uuidv4(),
                group_name: '',
                user_amount: 0,
            })
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Error saving user group:', error)
        }
    }

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {mode === 'create' ? (
                    <Button>Add New Group</Button>
                ) : (
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit
                    </DropdownMenuItem>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Add New Group' : 'Edit Group'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create' ? 'Create a new user group here.' : 'Edit user group information here.'} Click save when done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="groupName">Group Name</Label>
                        <Input 
                            id="groupName" 
                            value={formData.group_name}
                            onChange={(e) => handleInputChange('group_name', e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="userAmount">User Amount</Label>
                        <Input 
                            id="userAmount" 
                            type="number"
                            value={formData.user_amount}
                            disabled
                            // onChange={(e) => handleInputChange('user_amount', Number(e.target.value))}
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