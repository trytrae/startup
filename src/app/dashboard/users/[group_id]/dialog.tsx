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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function DialogNewUser({ user, mode = 'create' }: { user?: User, mode?: 'create' | 'edit' }) {
    // 将 supabase 客户端创建移到 useEffect 外部并使用 useMemo
    const supabase = React.useMemo(() => createClient(), []);
    const router = useRouter()
    const [open, setOpen] = useState(false)
    // 添加群组列表状态
    const [groups, setGroups] = useState<{ group_id: string; group_name: string }[]>([])
    const [formData, setFormData] = useState({
        user_id: user?.user_id || uuidv4(),
        group_id: user?.group_id || '',  // 添加 group_id 字段
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
                group_id: '',
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

    // 添加获取群组数据的函数
    React.useEffect(() => {
        const fetchGroups = async () => {
            const { data, error } = await supabase
                .from('usergroup')
                .select('group_id, group_name')
            
            if (error) {
                console.error('Error fetching groups:', error)
                return
            }
            
            if (data) {
                setGroups(data)
            }
        }

        fetchGroups()
    }, [supabase])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* <DialogTrigger asChild>
                {mode === 'create' ? (
                    <Button>Add New</Button>
                ) : (
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit
                    </DropdownMenuItem>
                )}
            </DialogTrigger> */}
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

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="group_id">User Group</Label>
                        <Select 
                            value={formData.group_id}
                            onValueChange={(value) => handleInputChange('group_id', value)}
                        >
                            <SelectTrigger id="group_id">
                                <SelectValue placeholder="Select a group" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                {groups.map((group) => (
                                    <SelectItem key={group.group_id} value={group.group_id}>
                                        {group.group_name}
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
 