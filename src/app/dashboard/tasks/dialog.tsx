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

export function DialogNewTask() {

    //supabase

    return (
        <Dialog >
            <DialogTrigger asChild>
                <Button >Add New</Button>
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
                        <Label htmlFor="task_name" >
                            Task Name
                        </Label>
                        <Input id="task_name" className="col-span-3" />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="task_type">Task Type</Label>
                        <Select>
                            <SelectTrigger id="task_type">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectItem value="User demand research">User demand research</SelectItem>
                                <SelectItem value="Product proof-of-concept research">Product proof-of-concept research</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="user_id"  >
                            User Portraits ID
                        </Label>
                        <Input id="user_id"  className="col-span-3" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="outline">Research Outline</Label>
                        <Textarea  id="outline" placeholder="Outline of your research" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}



