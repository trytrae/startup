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
import { UserGroup } from "./columns"

export function DialogNewUser({ user, mode = 'create' }: { user?: User, mode?: 'create' | 'edit' }) {
    const supabase = createClient()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        user_id: user?.user_id || uuidv4(),
        city: user?.city || '',
        occupation: user?.occupation || '',
        child_age: user?.child_age || 0,
        lifestyle: user?.lifestyle || '',
        annual_clothing_spend: user?.annual_clothing_spend || 0,
        purchase_history1: user?.purchase_history1 || '',
        purchase_history2: user?.purchase_history2 || '',
        purchase_history3: user?.purchase_history3 || ''
    })
    
    const handleSubmit = async () => {
        console.log(formData)
        try {
            if (mode === 'edit' && user) {
                const { error } = await supabase
                    .from('users')
                    .update(formData)
                    .eq('user_id', user.user_id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('users')
                    .insert([formData])

                if (error) throw error
            }
            
            setFormData({
                user_id: user?.user_id || uuidv4(),
                city: '',
                occupation: '',
                child_age: 0,
                lifestyle: '',
                annual_clothing_spend: 0,
                purchase_history1: '',
                purchase_history2: '',
                purchase_history3: ''
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
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Add New User' : 'Edit User'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create' ? 'Create a new user here.' : 'Edit user information here.'} Click save when done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="city">City</Label>
                        <Input 
                            id="city" 
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input 
                            id="occupation" 
                            value={formData.occupation}
                            onChange={(e) => handleInputChange('occupation', e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="childAge">Child Age</Label>
                        <Input 
                            id="childAge" 
                            type="number"
                            value={formData.child_age}
                            onChange={(e) => handleInputChange('child_age', Number(e.target.value))}
                        />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="lifestyle">Lifestyle</Label>
                        <Input 
                            id="lifestyle" 
                            value={formData.lifestyle}
                            onChange={(e) => handleInputChange('lifestyle', e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="annualClothingSpend">Annual Children's Clothing Spend (CNY)</Label>
                        <Input 
                            id="annualClothingSpend" 
                            type="number"
                            value={formData.annual_clothing_spend}
                            onChange={(e) => handleInputChange('annual_clothing_spend', Number(e.target.value))}
                        />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="purchaseHistory1">Purchase History 1</Label>
                        <Input 
                            id="purchaseHistory1" 
                            value={formData.purchase_history1}
                            onChange={(e) => handleInputChange('purchase_history1', e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="purchaseHistory2">Purchase History 2</Label>
                        <Input 
                            id="purchaseHistory2" 
                            value={formData.purchase_history2}
                            onChange={(e) => handleInputChange('purchase_history2', e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="purchaseHistory3">Purchase History 3</Label>
                        <Input 
                            id="purchaseHistory3" 
                            value={formData.purchase_history3}
                            onChange={(e) => handleInputChange('purchase_history3', e.target.value)}
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
                            onChange={(e) => handleInputChange('user_amount', Number(e.target.value))}
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