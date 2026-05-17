// components/ImportTasksModal.tsx
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { addSingleTaskJson } from '@/app/actions/tasks'

interface CSVTask {
    title: string
    description: string | null
    department: string
    deadline: string | null
    status: string
    assigneeId: string | null
    assigneeName?: string
    validationError?: string
    importStatus?: 'pending' | 'success' | 'error'
    errorMsg?: string
}

export default function ImportTasksModal({ eventId, teamMembers }: {
    eventId: string
    teamMembers: any[]
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [isDragOver, setIsDragOver] = useState(false)
    const [parsedTasks, setParsedTasks] = useState<CSVTask[]>([])
    const [selectedTasks, setSelectedTasks] = useState<CSVTask[]>([])
    const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
    const [currentImportIndex, setCurrentImportIndex] = useState(0)
    const [errorMessage, setErrorMessage] = useState('')
    
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    // Helper: RFC 4180 robust CSV parser
    function parseCSV(text: string): string[][] {
        const lines: string[][] = []
        let row: string[] = [""]
        let inQuotes = false

        for (let i = 0; i < text.length; i++) {
            const char = text[i]
            const nextChar = text[i + 1]

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    row[row.length - 1] += '"'
                    i++ // Skip next quote
                } else {
                    inQuotes = !inQuotes
                }
            } else if (char === ',' && !inQuotes) {
                row.push("")
            } else if ((char === '\r' || char === '\n') && !inQuotes) {
                if (char === '\r' && nextChar === '\n') {
                    i++ // Skip \n
                }
                lines.push(row)
                row = [""]
            } else {
                row[row.length - 1] += char
            }
        }
        if (row.length > 1 || row[0] !== "") {
            lines.push(row)
        }
        return lines
    }

    // Process parsed CSV rows into structures
    function processCSVData(csvRows: string[][]) {
        if (csvRows.length < 2) {
            setErrorMessage('CSV file must have a header row and at least one task.')
            return
        }

        const headers = csvRows[0].map(h => h.trim().toLowerCase())
        
        // Find indices of columns
        const titleIndex = headers.findIndex(h => ['title', 'task', 'task name', 'name', 'subject'].includes(h))
        const descIndex = headers.findIndex(h => ['description', 'desc', 'details', 'body', 'about'].includes(h))
        const deptIndex = headers.findIndex(h => ['department', 'dept', 'team', 'group'].includes(h))
        const deadlineIndex = headers.findIndex(h => ['deadline', 'due date', 'due', 'date', 'time'].includes(h))
        const statusIndex = headers.findIndex(h => ['status', 'state', 'stage'].includes(h))
        const assigneeIndex = headers.findIndex(h => ['assignee', 'assigned to', 'member', 'user', 'person'].includes(h))

        if (titleIndex === -1) {
            setErrorMessage('CSV header must contain a "Title" column.')
            return
        }

        const tasks: CSVTask[] = []

        for (let i = 1; i < csvRows.length; i++) {
            const row = csvRows[i]
            if (row.length === 1 && row[0] === '') continue // skip empty line

            const rawTitle = row[titleIndex] || ''
            const rawDesc = descIndex !== -1 ? row[descIndex] : ''
            const rawDept = deptIndex !== -1 ? row[deptIndex] : ''
            const rawDeadline = deadlineIndex !== -1 ? row[deadlineIndex] : ''
            const rawStatus = statusIndex !== -1 ? row[statusIndex] : ''
            const rawAssignee = assigneeIndex !== -1 ? row[assigneeIndex] : ''

            if (!rawTitle.trim()) continue // Skip rows with empty titles

            // Normalize Department
            let dept = 'Other'
            const cleanedDept = rawDept.trim().toLowerCase()
            if (cleanedDept.includes('graph')) dept = 'Graphics'
            else if (cleanedDept.includes('product')) dept = 'Production'
            else if (cleanedDept.includes('sculpt')) dept = 'Sculpture'

            // Normalize Status
            let status = 'Pending'
            const cleanedStatus = rawStatus.trim().toLowerCase()
            if (cleanedStatus.includes('request')) status = 'Requested'
            else if (cleanedStatus.includes('pend') || cleanedStatus.includes('backlog')) status = 'Pending'
            else if (cleanedStatus.includes('ongoing') || cleanedStatus.includes('progress') || cleanedStatus.includes('active')) status = 'Ongoing'
            else if (cleanedStatus.includes('qc') || cleanedStatus.includes('review')) status = 'QC'
            else if (cleanedStatus.includes('deliver') || cleanedStatus.includes('done') || cleanedStatus.includes('complete')) status = 'Delivered'
            else if (cleanedStatus.includes('reject')) status = 'Rejected'

            // Normalize Deadline / Date
            let deadline: string | null = null
            if (rawDeadline.trim()) {
                const parsedDate = new Date(rawDeadline.trim())
                if (!isNaN(parsedDate.getTime())) {
                    // format to ISO or local datetime suitable for datetime-local (YYYY-MM-DDTHH:MM)
                    const tzOffset = parsedDate.getTimezoneOffset() * 60000
                    const localISOTime = new Date(parsedDate.getTime() - tzOffset).toISOString().slice(0, 16)
                    deadline = localISOTime
                }
            }

            // Find matching assignee
            let assigneeId: string | null = null
            let assigneeName = ''
            if (rawAssignee.trim()) {
                const search = rawAssignee.trim().toLowerCase()
                const match = teamMembers.find(m => 
                    m.profiles?.full_name?.toLowerCase().includes(search) || 
                    search.includes(m.profiles?.full_name?.toLowerCase())
                )
                if (match) {
                    assigneeId = match.user_id
                    assigneeName = match.profiles?.full_name || ''
                } else {
                    assigneeName = rawAssignee.trim() // Keep raw name to show "Not Found" state or let user map it
                }
            }

            tasks.push({
                title: rawTitle.trim(),
                description: rawDesc ? rawDesc.trim() : null,
                department: dept,
                deadline,
                status,
                assigneeId,
                assigneeName: assigneeName || undefined
            })
        }

        if (tasks.length === 0) {
            setErrorMessage('No valid tasks found in the file.')
            return
        }

        setParsedTasks(tasks)
        setSelectedTasks(tasks) // Select all by default
        setErrorMessage('')
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target?.result as string
            try {
                const rows = parseCSV(text)
                processCSVData(rows)
            } catch (err) {
                setErrorMessage('Error parsing CSV file. Make sure it is formatted correctly.')
                console.error(err)
            }
        }
        reader.readAsText(file)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = () => {
        setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file && file.name.endsWith('.csv')) {
            const reader = new FileReader()
            reader.onload = (event) => {
                const text = event.target?.result as string
                try {
                    const rows = parseCSV(text)
                    processCSVData(rows)
                } catch (err) {
                    setErrorMessage('Error parsing CSV file.')
                    console.error(err)
                }
            }
            reader.readAsText(file)
        } else {
            setErrorMessage('Please upload a valid .csv file.')
        }
    }

    const downloadTemplate = () => {
        const headers = ['Title', 'Description', 'Department', 'Due Date', 'Status', 'Assignee Name']
        const rows = [
            ['Setup Sound Equipment', 'Bring the secondary speakers and connect the mixer', 'Production', '2026-06-01 14:00', 'Pending', ''],
            ['Create Social Banners', 'Resize the master asset for FB, Twitter and IG', 'Graphics', '2026-06-02 09:00', 'Pending', ''],
            ['Finish Mold Prep', 'Preheat mold base and prepare standard composite material', 'Sculpture', '2026-06-03 17:30', 'Ongoing', '']
        ]
        
        const csvContent = [
            headers.join(','), 
            ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', 'task_import_template.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const toggleTaskSelection = (task: CSVTask) => {
        if (selectedTasks.includes(task)) {
            setSelectedTasks(prev => prev.filter(t => t !== task))
        } else {
            setSelectedTasks(prev => [...prev, task])
        }
    }

    const updateParsedTask = (index: number, key: keyof CSVTask, value: any) => {
        const updated = [...parsedTasks]
        updated[index] = { ...updated[index], [key]: value } as CSVTask
        setParsedTasks(updated)

        // Sync selection reference
        setSelectedTasks(prev => {
            const hasTask = prev.some(t => parsedTasks[index] === t)
            if (hasTask) {
                return prev.map(t => t === parsedTasks[index] ? updated[index] : t)
            }
            return prev
        })
    }

    const startImport = async () => {
        if (selectedTasks.length === 0) return

        setImportStatus('processing')
        setCurrentImportIndex(0)

        // Initialize status on parsedTasks
        const trackingTasks = parsedTasks.map(t => {
            if (selectedTasks.includes(t)) {
                return { ...t, importStatus: 'pending' as const }
            }
            return t
        })
        setParsedTasks(trackingTasks)

        const tasksToImport = trackingTasks.filter(t => t.importStatus === 'pending')

        for (let i = 0; i < tasksToImport.length; i++) {
            const currentTask = tasksToImport[i]
            const originalIndex = trackingTasks.findIndex(t => t.title === currentTask.title && t.description === currentTask.description)
            
            setCurrentImportIndex(i)

            try {
                await addSingleTaskJson({
                    eventId,
                    title: currentTask.title,
                    description: currentTask.description,
                    department: currentTask.department,
                    deadline: currentTask.deadline,
                    status: currentTask.status,
                    assigneeIds: currentTask.assigneeId ? [currentTask.assigneeId] : []
                })

                trackingTasks[originalIndex].importStatus = 'success'
                setParsedTasks([...trackingTasks])
            } catch (err: any) {
                console.error('Failed to import task:', currentTask.title, err)
                trackingTasks[originalIndex].importStatus = 'error'
                trackingTasks[originalIndex].errorMsg = err.message || 'Server error'
                setParsedTasks([...trackingTasks])
            }
        }

        setImportStatus('success')
        router.refresh()
    }

    const resetModal = () => {
        setParsedTasks([])
        setSelectedTasks([])
        setImportStatus('idle')
        setCurrentImportIndex(0)
        setErrorMessage('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleClose = () => {
        if (importStatus === 'processing') return // Prevent close during import
        setIsOpen(false)
        resetModal()
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-bg-subtle hover:bg-bg-elevated border border-border hover:border-border-hover text-text-primary rounded-lg text-xs font-medium transition-all"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Import Sheet
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
                    onClick={handleClose}
                >
                    <div
                        className="bg-bg-elevated border border-border rounded-xl max-w-4xl w-full p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                            <div>
                                <h2 className="text-base font-semibold text-text-primary">
                                    Import Tasks from Sheet
                                </h2>
                                <p className="text-xs text-text-muted mt-0.5">
                                    Add multiple tasks to your project at once via a .csv file
                                </p>
                            </div>
                            {importStatus !== 'processing' && (
                                <button onClick={handleClose} className="text-text-muted hover:text-text-primary transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            )}
                        </div>

                        {/* Error Alert */}
                        {errorMessage && (
                            <div className="mb-4 bg-danger/10 border border-danger/20 rounded-lg p-3 text-xs text-danger flex items-start gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto min-h-[250px] pr-1 custom-scrollbar">
                            {importStatus === 'idle' && parsedTasks.length === 0 && (
                                <div className="space-y-6">
                                    {/* Upload Area */}
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[200px] ${
                                            isDragOver 
                                                ? 'border-accent bg-accent/5' 
                                                : 'border-border hover:border-border-hover hover:bg-bg-subtle/50'
                                        }`}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept=".csv"
                                            className="hidden"
                                        />
                                        <div className="w-12 h-12 rounded-full bg-accent-subtle flex items-center justify-center text-accent mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                        </div>
                                        <p className="text-sm font-medium text-text-primary">
                                            Drag & Drop your .csv file here
                                        </p>
                                        <p className="text-xs text-text-muted mt-1">
                                            or click to browse from your computer
                                        </p>
                                    </div>

                                    {/* Instructions and Template */}
                                    <div className="bg-bg-subtle/50 border border-border rounded-xl p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                                                Sheet Formatting Guide
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={downloadTemplate}
                                                className="text-xs font-medium text-accent hover:text-accent-hover flex items-center gap-1 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                                Download Template CSV
                                            </button>
                                        </div>

                                        <p className="text-xs text-text-secondary leading-relaxed">
                                            Ensure your sheet has a header row. Columns can be in any order. The following column titles are detected:
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                            <div className="bg-bg-elevated border border-border rounded-lg p-2.5 flex items-start gap-2">
                                                <span className="px-1.5 py-0.5 bg-accent/20 text-accent font-semibold rounded text-[10px]">Title</span>
                                                <div>
                                                    <p className="font-medium text-text-primary">Title (Required)</p>
                                                    <p className="text-text-muted text-[10px] mt-0.5">The task name. E.g. "Draft event proposal"</p>
                                                </div>
                                            </div>
                                            <div className="bg-bg-elevated border border-border rounded-lg p-2.5 flex items-start gap-2">
                                                <span className="px-1.5 py-0.5 bg-bg-subtle text-text-secondary font-semibold rounded text-[10px]">Description</span>
                                                <div>
                                                    <p className="font-medium text-text-primary">Description (Optional)</p>
                                                    <p className="text-text-muted text-[10px] mt-0.5">Detailed notes. E.g. "Draft guidelines for logistics team"</p>
                                                </div>
                                            </div>
                                            <div className="bg-bg-elevated border border-border rounded-lg p-2.5 flex items-start gap-2">
                                                <span className="px-1.5 py-0.5 bg-bg-subtle text-text-secondary font-semibold rounded text-[10px]">Department</span>
                                                <div>
                                                    <p className="font-medium text-text-primary">Department (Optional)</p>
                                                    <p className="text-text-muted text-[10px] mt-0.5">Values: Graphics, Production, Sculpture (Default: Other)</p>
                                                </div>
                                            </div>
                                            <div className="bg-bg-elevated border border-border rounded-lg p-2.5 flex items-start gap-2">
                                                <span className="px-1.5 py-0.5 bg-bg-subtle text-text-secondary font-semibold rounded text-[10px]">Due Date</span>
                                                <div>
                                                    <p className="font-medium text-text-primary">Due Date (Optional)</p>
                                                    <p className="text-text-muted text-[10px] mt-0.5">Date string. E.g. "2026-05-30 15:00"</p>
                                                </div>
                                            </div>
                                            <div className="bg-bg-elevated border border-border rounded-lg p-2.5 flex items-start gap-2">
                                                <span className="px-1.5 py-0.5 bg-bg-subtle text-text-secondary font-semibold rounded text-[10px]">Status</span>
                                                <div>
                                                    <p className="font-medium text-text-primary">Status (Optional)</p>
                                                    <p className="text-text-muted text-[10px] mt-0.5">E.g. Pending (Backlog), Ongoing (In progress), Delivered (Done)</p>
                                                </div>
                                            </div>
                                            <div className="bg-bg-elevated border border-border rounded-lg p-2.5 flex items-start gap-2">
                                                <span className="px-1.5 py-0.5 bg-bg-subtle text-text-secondary font-semibold rounded text-[10px]">Assignee</span>
                                                <div>
                                                    <p className="font-medium text-text-primary">Assignee Name (Optional)</p>
                                                    <p className="text-text-muted text-[10px] mt-0.5">We will match by their Full Name in the project staff roster</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Preview Parsed Tasks */}
                            {importStatus === 'idle' && parsedTasks.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-xs text-text-secondary border-b border-border pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-text-primary bg-accent/20 px-2 py-0.5 rounded-full text-[11px]">
                                                {selectedTasks.length} / {parsedTasks.length} Selected
                                            </span>
                                            <span>tasks ready to import</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={resetModal}
                                            className="text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                            Clear Sheet
                                        </button>
                                    </div>

                                    {/* Preview Table */}
                                    <div className="border border-border rounded-lg overflow-hidden bg-bg-subtle/20 max-h-[400px] overflow-y-auto custom-scrollbar">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead className="bg-bg-subtle text-text-secondary sticky top-0 z-10 border-b border-border">
                                                <tr>
                                                    <th className="p-3 w-10 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedTasks.length === parsedTasks.length}
                                                            onChange={() => {
                                                                if (selectedTasks.length === parsedTasks.length) {
                                                                    setSelectedTasks([])
                                                                } else {
                                                                    setSelectedTasks(parsedTasks)
                                                                }
                                                            }}
                                                            className="rounded accent-accent w-3.5 h-3.5 cursor-pointer"
                                                        />
                                                    </th>
                                                    <th className="p-3 font-semibold">Task Title</th>
                                                    <th className="p-3 font-semibold">Description</th>
                                                    <th className="p-3 font-semibold w-32">Department</th>
                                                    <th className="p-3 font-semibold w-40">Due Date</th>
                                                    <th className="p-3 font-semibold w-28">Status</th>
                                                    <th className="p-3 font-semibold w-40">Assignee</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {parsedTasks.map((task, index) => {
                                                    const isSelected = selectedTasks.includes(task)
                                                    return (
                                                        <tr key={index} className={`hover:bg-bg-subtle/30 transition-colors ${isSelected ? '' : 'opacity-40'}`}>
                                                            <td className="p-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleTaskSelection(task)}
                                                                    className="rounded accent-accent w-3.5 h-3.5 cursor-pointer"
                                                                />
                                                            </td>
                                                            <td className="p-3 font-medium text-text-primary">
                                                                <input
                                                                    type="text"
                                                                    value={task.title}
                                                                    onChange={e => updateParsedTask(index, 'title', e.target.value)}
                                                                    className="bg-transparent outline-none focus:bg-bg-subtle focus:px-1.5 py-0.5 rounded w-full border-b border-transparent focus:border-accent text-xs"
                                                                />
                                                            </td>
                                                            <td className="p-3 text-text-secondary max-w-xs truncate">
                                                                <input
                                                                    type="text"
                                                                    value={task.description || ''}
                                                                    placeholder="No description"
                                                                    onChange={e => updateParsedTask(index, 'description', e.target.value || null)}
                                                                    className="bg-transparent outline-none focus:bg-bg-subtle focus:px-1.5 py-0.5 rounded w-full border-b border-transparent focus:border-accent text-xs placeholder:text-text-muted/60"
                                                                />
                                                            </td>
                                                            <td className="p-3">
                                                                <select
                                                                    value={task.department}
                                                                    onChange={e => updateParsedTask(index, 'department', e.target.value)}
                                                                    className="bg-bg-subtle/80 border border-border rounded px-1.5 py-1 text-[11px] text-text-primary outline-none focus:border-accent w-full"
                                                                >
                                                                    <option value="Graphics">Graphics</option>
                                                                    <option value="Production">Production</option>
                                                                    <option value="Sculpture">Sculpture</option>
                                                                    <option value="Other">Other</option>
                                                                </select>
                                                            </td>
                                                            <td className="p-3">
                                                                <input
                                                                    type="datetime-local"
                                                                    value={task.deadline || ''}
                                                                    onChange={e => updateParsedTask(index, 'deadline', e.target.value || null)}
                                                                    className="bg-bg-subtle/80 border border-border rounded px-1.5 py-1 text-[11px] text-text-primary outline-none focus:border-accent w-full"
                                                                />
                                                            </td>
                                                            <td className="p-3">
                                                                <select
                                                                    value={task.status}
                                                                    onChange={e => updateParsedTask(index, 'status', e.target.value)}
                                                                    className="bg-bg-subtle/80 border border-border rounded px-1.5 py-1 text-[11px] text-text-primary outline-none focus:border-accent w-full"
                                                                >
                                                                    <option value="Requested">Requested</option>
                                                                    <option value="Pending">Backlog</option>
                                                                    <option value="Ongoing">In Progress</option>
                                                                    <option value="QC">Review</option>
                                                                    <option value="Delivered">Done</option>
                                                                    <option value="Rejected">Rejected</option>
                                                                </select>
                                                            </td>
                                                            <td className="p-3">
                                                                <select
                                                                    value={task.assigneeId || ''}
                                                                    onChange={e => {
                                                                        const memberId = e.target.value || null
                                                                        const matchedMember = teamMembers.find(m => m.user_id === memberId)
                                                                        updateParsedTask(index, 'assigneeId', memberId)
                                                                        updateParsedTask(index, 'assigneeName', matchedMember?.profiles?.full_name || '')
                                                                    }}
                                                                    className={`border rounded px-1.5 py-1 text-[11px] outline-none focus:border-accent w-full ${
                                                                        task.assigneeId 
                                                                            ? 'bg-bg-subtle/80 text-text-primary border-border' 
                                                                            : task.assigneeName 
                                                                                ? 'bg-danger-subtle text-danger border-danger/30' // Assigned but not matched
                                                                                : 'bg-bg-subtle/30 text-text-muted border-border/50'
                                                                    }`}
                                                                >
                                                                    <option value="">Unassigned</option>
                                                                    {task.assigneeName && !task.assigneeId && (
                                                                        <option value="" disabled className="text-danger font-semibold">
                                                                            ⚠️ Match "{task.assigneeName}"...
                                                                        </option>
                                                                    )}
                                                                    {teamMembers.map(member => (
                                                                        <option key={member.user_id} value={member.user_id}>
                                                                            {member.profiles?.full_name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Processing Screen */}
                            {importStatus === 'processing' && (
                                <div className="py-10 flex flex-col items-center justify-center space-y-6">
                                    <div className="relative w-20 h-20 flex items-center justify-center">
                                        <div className="spinner absolute" />
                                        <span className="text-xs font-semibold text-accent font-mono">
                                            {Math.round((currentImportIndex / selectedTasks.length) * 100)}%
                                        </span>
                                    </div>

                                    <div className="text-center space-y-1.5">
                                        <h3 className="text-sm font-semibold text-text-primary">
                                            Importing Tasks...
                                        </h3>
                                        <p className="text-xs text-text-secondary max-w-sm truncate px-4">
                                            Adding {currentImportIndex + 1} of {selectedTasks.length}: <span className="font-medium text-accent">"{selectedTasks[currentImportIndex]?.title}"</span>
                                        </p>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full max-w-md bg-bg-subtle border border-border h-2.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-accent h-full rounded-full transition-all duration-300 ease-out"
                                            style={{ width: `${(currentImportIndex / selectedTasks.length) * 100}%` }}
                                        />
                                    </div>

                                    {/* Live Logs */}
                                    <div className="w-full max-w-lg bg-bg-subtle/80 border border-border rounded-lg p-3 max-h-[160px] overflow-y-auto custom-scrollbar text-[10px] font-mono space-y-1 text-text-secondary">
                                        {parsedTasks.map((task, i) => {
                                            if (!selectedTasks.includes(task)) return null
                                            return (
                                                <div key={i} className="flex items-center justify-between border-b border-border/20 pb-1 last:border-0">
                                                    <span className="truncate max-w-[320px]">{task.title}</span>
                                                    <span>
                                                        {task.importStatus === 'success' && <span className="text-success">✓ Success</span>}
                                                        {task.importStatus === 'error' && <span className="text-danger">✗ Failed ({task.errorMsg})</span>}
                                                        {task.importStatus === 'pending' && <span className="text-text-muted">Waiting...</span>}
                                                        {!task.importStatus && <span className="text-text-muted">Skipped</span>}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Success Screen */}
                            {importStatus === 'success' && (
                                <div className="py-10 flex flex-col items-center justify-center space-y-5">
                                    <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center text-success">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    </div>

                                    <div className="text-center space-y-1">
                                        <h3 className="text-base font-semibold text-text-primary">
                                            Import Completed!
                                        </h3>
                                        <p className="text-xs text-text-secondary">
                                            Successfully imported {parsedTasks.filter(t => t.importStatus === 'success').length} tasks to this project.
                                        </p>
                                        {parsedTasks.some(t => t.importStatus === 'error') && (
                                            <p className="text-xs text-danger">
                                                {parsedTasks.filter(t => t.importStatus === 'error').length} tasks failed to import. Check details below.
                                            </p>
                                        )}
                                    </div>

                                    {/* Summary Table */}
                                    <div className="w-full max-w-xl bg-bg-subtle/80 border border-border rounded-lg p-3 max-h-[200px] overflow-y-auto custom-scrollbar text-[11px] space-y-1">
                                        {parsedTasks.map((task, i) => {
                                            if (!selectedTasks.includes(task)) return null
                                            return (
                                                <div key={i} className="flex items-start justify-between border-b border-border/20 py-1.5 last:border-0 gap-4">
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-text-primary truncate">{task.title}</p>
                                                        {task.errorMsg && <p className="text-[10px] text-danger mt-0.5">{task.errorMsg}</p>}
                                                    </div>
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                                        task.importStatus === 'success' 
                                                            ? 'bg-success/10 text-success' 
                                                            : 'bg-danger/10 text-danger'
                                                    }`}>
                                                        {task.importStatus === 'success' ? 'SUCCESS' : 'FAILED'}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 pt-4 border-t border-border mt-4">
                            {importStatus === 'idle' && parsedTasks.length > 0 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={resetModal}
                                        className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        type="button"
                                        onClick={startImport}
                                        disabled={selectedTasks.length === 0}
                                        className="flex-[2] bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        Import {selectedTasks.length} Tasks
                                    </button>
                                </>
                            )}
                            {importStatus === 'idle' && parsedTasks.length === 0 && (
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="w-full px-4 py-2.5 bg-bg-subtle hover:bg-bg-elevated border border-border text-sm font-medium text-text-primary rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                            {importStatus === 'success' && (
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="w-full px-4 py-2.5 bg-accent hover:bg-accent-hover text-sm font-medium text-white rounded-lg transition-colors"
                                >
                                    Finished
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
