import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Steps,
    StepsContent,
    StepsItem,
} from "@/components/ui/steps"
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'

interface ImportData {
    user_id: string
    city: string
    occupation: string
    child_age: number
    lifestyle: string
    annual_clothing_spend: number
    purchase_history1: string
    purchase_history2: string
    purchase_history3: string
    validation?: string
}

interface ImportExcelDialogProps {
    onRefresh: () => void
}

export function ImportExcelDialog({ onRefresh }: ImportExcelDialogProps) {
    const supabase = createClient()
    const router = useRouter()
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [importData, setImportData] = useState<ImportData[]>([])
    const [groupName, setGroupName] = useState('')
    const [validationErrors, setValidationErrors] = useState<{
        success: number
        failed: number
        data: ImportData[]
    }>({ success: 0, failed: 0, data: [] })

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        onDrop: async (files) => {
            const file = files[0]
            const reader = new FileReader()

            reader.onload = (e) => {
                try {
                    const data = e.target?.result
                    const workbook = XLSX.read(data, { type: 'binary' })
                    const sheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[sheetName]
                    const jsonData = XLSX.utils.sheet_to_json(worksheet)

                    validateData(jsonData as ImportData[])
                } catch (error) {
                    console.error('Error reading file:', error)
                    toast({
                        title: "Error reading file",
                        description: "An error occurred while reading the file. Please try again",
                        variant: "destructive"
                    })
                }
            }

            reader.readAsBinaryString(file)
        }
    })

    const validateData = (data: ImportData[]) => {
        let success = 0
        let failed = 0

        const validatedData = data.map(row => {
            const errors = []
            if (!row.user_id) errors.push('用户ID不能为空')
            if (!row.city) errors.push('城市不能为空')
            if (!row.occupation) errors.push('职业不能为空')
            if (!row.child_age || !Number.isInteger(row.child_age) || row.child_age < 1 || row.child_age > 18) errors.push('孩子年龄无效');
            if (!row.lifestyle) errors.push('生活方式不能为空')
            if (!row.annual_clothing_spend || !Number.isInteger(row.annual_clothing_spend) || row.annual_clothing_spend <= 0)
                errors.push('年度服装支出必须是大于0的整数');
            if (!row.purchase_history1) errors.push('购买历史1不能为空')
            if (!row.purchase_history2) errors.push('购买历史2不能为空')
            if (!row.purchase_history3) errors.push('购买历史3不能为空')

            if (errors.length === 0) {
                success++
                return row
            } else {
                failed++
                return { ...row, validation: errors.join('; ') }
            }
        })

        setValidationErrors({
            success,
            failed,
            data: validatedData
        })
        setImportData(validatedData)
        setCurrentStep(1)

        toast({
            title: "Validation completed",
            description: `${success} successful, ${failed} failed`
        })
    }

    const downloadTemplate = () => {
        const template = XLSX.utils.book_new()
        const templateData = [
            {
                user_id: '',
                city: '',
                occupation: '',
                child_age: '',
                lifestyle: '',
                annual_clothing_spend: '',
                purchase_history1: '',
                purchase_history2: '',
                purchase_history3: ''
            }
        ]

        const ws = XLSX.utils.json_to_sheet(templateData)
        XLSX.utils.book_append_sheet(template, ws, 'Template')
        XLSX.writeFile(template, 'user_import_template.xlsx')
    }

    const downloadValidationResult = () => {
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(validationErrors.data)
        XLSX.utils.book_append_sheet(wb, ws, 'Validation Results')
        XLSX.writeFile(wb, 'validation_results.xlsx')
    }

    const handleImport = async () => {
        try {
            const supabase = createClient()

            const { data: newGroup, error: groupError } = await supabase
                .from('usergroup')
                .insert([{
                    group_id: uuidv4(),
                    group_name: groupName,
                    user_amount: validationErrors.success
                }])
                .select()
                .single()

            if (groupError) throw groupError

            const validUsers = importData
                .filter(user => !user.validation)
                .map(user => ({
                    ...user,
                    group_id: newGroup.group_id
                }))

            const { error: usersError } = await supabase
                .from('users')
                .insert(validUsers)

            if (usersError) throw usersError

            setOpen(false)
            setCurrentStep(0)
            setImportData([])
            setGroupName('')
            setValidationErrors({ success: 0, failed: 0, data: [] })

            toast({
                title: "Import successful",
                description: "Data has been successfully imported into the system"
            })
            router.refresh()
        } catch (error) {
            console.error('Error importing data:', error)
            toast({
                title: "Import failed.",
                description: "An error occurred while importing data. Please try again",
                variant: "destructive"
            })
        }
    }
    const truncateText = (text: string) => {
        if (!text) return '';
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        const truncated = lines.slice(0, 2).join('\n');
        return truncated + (lines.length > 2 ? '...' : '');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add New Group</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[60vw] h-[60vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Import Excel</DialogTitle>
                    <DialogDescription>
                        Please complete data import according to the steps
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <Steps value={currentStep} className="px-6">
                        <StepsItem title="1" />
                        <StepsItem title="2" />
                        <StepsItem title="3" />
                    </Steps>

                    <div className="flex-1 overflow-hidden">
                        <StepsContent value={currentStep} index={0}>
                            <div className="space-y-4 p-6">
                                <Button onClick={downloadTemplate}>
                                    Download template
                                </Button>

                                <div {...getRootProps()} className="border-2 border-dashed p-8 text-center cursor-pointer">
                                    <input {...getInputProps()} />
                                    <p>Drag and drop files here or click to select files
                                    </p>
                                </div>
                            </div>
                        </StepsContent>

                        <StepsContent value={currentStep} index={1}>
                            <div className="space-y-4 p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p>Verification result： {validationErrors.success} successful ， {validationErrors.failed} failed </p>
                                    </div>
                                    {validationErrors.failed > 0 && (
                                        <Button onClick={downloadValidationResult}>
                                            Download result
                                        </Button>)}

                                </div>

                                <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-background z-10">
                                            <TableRow>
                                                <TableHead>user_id</TableHead>
                                                <TableHead>city</TableHead>
                                                <TableHead>occupation</TableHead>
                                                <TableHead>age</TableHead>
                                                <TableHead>lifestyle</TableHead>
                                                <TableHead>spend</TableHead>
                                                <TableHead>purchase_history1</TableHead>
                                                <TableHead>purchase_history2</TableHead>
                                                <TableHead>purchase_history3</TableHead>
                                                {validationErrors.failed > 0 && (
                                                    <TableHead>Verification result</TableHead>
                                                )}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {importData.map((row, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{row.user_id}</TableCell>
                                                    <TableCell>{row.city}</TableCell>
                                                    <TableCell>{row.occupation}</TableCell>
                                                    <TableCell>{row.child_age}</TableCell>
                                                    <TableCell>{row.lifestyle}</TableCell>
                                                    <TableCell>{row.annual_clothing_spend}</TableCell>
                                                    <TableCell className=" py-2">
                                                        <div className="line-clamp-2 text-sm">
                                                            {truncateText(row.purchase_history1)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className=" py-2">
                                                        <div className="line-clamp-2 text-sm">
                                                            {truncateText(row.purchase_history2)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-2">
                                                        <div className="line-clamp-2 text-sm">
                                                            {truncateText(row.purchase_history3)}
                                                        </div>
                                                    </TableCell>
                                                    {validationErrors.failed > 0 && (
                                                        <TableCell className="py-2">
                                                            <div className="line-clamp-2 text-sm text-red-500">
                                                                {truncateText(row.validation || '')}
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <div className='h-80'></div>
                                </div>
                            </div>
                        </StepsContent>

                        <StepsContent value={currentStep} index={2}>
                            <div className="space-y-4 p-6">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="groupName">Group Name</Label>
                                    <Input
                                        id="groupName"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        placeholder="Please enter the group name"
                                    />
                                </div>
                            </div>
                        </StepsContent>
                    </div>
                </div>

                <DialogFooter className="flex justify-between px-6 py-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        disabled={currentStep === 0}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            if (currentStep === 2) {
                                handleImport()
                            } else {
                                setCurrentStep(Math.min(2, currentStep + 1))
                            }
                        }}
                        disabled={
                            (currentStep === 0 && importData.length === 0) ||
                            (currentStep === 1 && validationErrors.failed > 0) ||
                            (currentStep === 2 && !groupName.trim())
                        }
                    >
                        {currentStep === 2 ? 'Completed' : 'Next'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}