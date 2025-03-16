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
import { User } from "./columns"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from 'uuid'

export function DialogNewUser({ user, mode = 'create' }: { user?: User, mode?: 'create' | 'edit' }) {
    const supabase = createClient()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        id: user?.id || uuidv4(),
        name: user?.name || '',
        amount: user?.amount || 0,
    })
    
    const handleSubmit = async () => {
        console.log(formData)
        try {
            if (mode === 'edit' && user) {
                const { error } = await supabase
                    .from('users')
                    .update(formData)
                    .eq('id', user.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('users')
                    .insert([formData])

                if (error) throw error
            }
            
            setFormData({
                id: user?.id || uuidv4(),
                name: '',
                amount: 0
            })
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Error saving user:', error)
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
                    <Button>Add New</Button>
                ) : (
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit
                    </DropdownMenuItem>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Add New User' : 'Edit User'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create' ? 'Create new user here.' : 'Edit user details here.'} Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="name">User Name</Label>
                        <Input 
                            id="name" 
                            className="col-span-3"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="amount">Amount</Label>
                        <Input 
                            id="amount" 
                            type="number"
                            className="col-span-3"
                            value={formData.amount}
                            onChange={(e) => handleInputChange('amount', Number(e.target.value))}
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