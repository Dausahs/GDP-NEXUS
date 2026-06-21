// components/ImportTasksModal.tsx
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { addSingleTaskJson } from '@/app/actions/tasks'

// ── Types ──────────────────────────────────────────────────────────────────
interface TaskRow {
    id: string
    title: string
    description: string
    department: string
    deadline: string
    status: string
    assigneeId: string
    importStatus?: 'pending' | 'success' | 'error'
    errorMsg?: string
}

type Tab = 'form' | 'csv'

const DEPTS = ['Graphics', 'Production', 'Sculpture', 'Other']
const STATUSES = [
    { value: 'Requested', label: 'Requested' },
    { value: 'Pending',   label: 'Backlog'   },
    { value: 'Ongoing',   label: 'In Progress'},
    { value: 'QC',        label: 'Review'    },
    { value: 'Delivered', label: 'Done'      },
]

function uid() { return Math.random().toString(36).slice(2) }

function blankRow(): TaskRow {
    return { id: uid(), title: '', description: '', department: 'Other', deadline: '', status: 'Requested', assigneeId: '' }
}

// ── CSV parser (RFC 4180) ──────────────────────────────────────────────────
function parseCSV(text: string): string[][] {
    const lines: string[][] = []
    let row = ['']
    let inQ = false
    for (let i = 0; i < text.length; i++) {
        const c = text[i], n = text[i + 1]
        if (c === '"') { if (inQ && n === '"') { row[row.length-1] += '"'; i++ } else inQ = !inQ }
        else if (c === ',' && !inQ) row.push('')
        else if ((c === '\r' || c === '\n') && !inQ) { if (c === '\r' && n === '\n') i++; lines.push(row); row = [''] }
        else row[row.length-1] += c
    }
    if (row.length > 1 || row[0]) lines.push(row)
    return lines
}

function csvToRows(csv: string, teamMembers: any[]): TaskRow[] {
    const raw = parseCSV(csv)
    if (raw.length < 2) return []
    const h = raw[0].map(x => x.trim().toLowerCase())
    const col = (names: string[]) => names.reduce((f, n) => f !== -1 ? f : h.indexOf(n), -1)
    const ti = col(['title','task','name','subject'])
    const di = col(['description','desc','details'])
    const dpi = col(['department','dept','team'])
    const dli = col(['deadline','due date','due','date'])
    const si = col(['status','state','stage'])
    const ai = col(['assignee','assigned to','member','person'])
    if (ti === -1) return []

    return raw.slice(1).filter(r => r[ti]?.trim()).map(r => {
        const rawDept = (dpi !== -1 ? r[dpi] : '').toLowerCase()
        let dept = 'Other'
        if (rawDept.includes('graph')) dept = 'Graphics'
        else if (rawDept.includes('prod')) dept = 'Production'
        else if (rawDept.includes('sculpt')) dept = 'Sculpture'

        const rawSt = (si !== -1 ? r[si] : '').toLowerCase()
        let status = 'Requested'
        if (rawSt.includes('pend') || rawSt.includes('backlog')) status = 'Pending'
        else if (rawSt.includes('ongo') || rawSt.includes('progress')) status = 'Ongoing'
        else if (rawSt.includes('qc') || rawSt.includes('review')) status = 'QC'
        else if (rawSt.includes('deliv') || rawSt.includes('done')) status = 'Delivered'

        let deadline = ''
        if (dli !== -1 && r[dli]?.trim()) {
            const d = new Date(r[dli].trim())
            if (!isNaN(d.getTime())) deadline = new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,16)
        }

        const rawA = ai !== -1 ? r[ai]?.trim() : ''
        const match = rawA ? teamMembers.find(m => m.profiles?.full_name?.toLowerCase().includes(rawA.toLowerCase())) : null

        return { id: uid(), title: r[ti].trim(), description: di !== -1 ? r[di]?.trim() : '', department: dept, deadline, status, assigneeId: match?.user_id || '' }
    })
}

// ── Main component ─────────────────────────────────────────────────────────
export default function ImportTasksModal({ eventId, teamMembers }: { eventId: string; teamMembers: any[] }) {
    const [open, setOpen] = useState(false)
    const [tab, setTab] = useState<Tab>('form')
    const [rows, setRows] = useState<TaskRow[]>([blankRow()])
    const [running, setRunning] = useState(false)
    const [done, setDone] = useState(false)
    const [csvError, setCsvError] = useState('')
    const [currentIdx, setCurrentIdx] = useState(0)
    const fileRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    // ── row helpers ──────────────────────────────────────────────────────
    const setRow = (id: string, patch: Partial<TaskRow>) =>
        setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r))

    const addRow = () => setRows(prev => [...prev, blankRow()])

    const removeRow = (id: string) =>
        setRows(prev => prev.length === 1 ? [blankRow()] : prev.filter(r => r.id !== id))

    const validRows = rows.filter(r => r.title.trim())

    // ── submit ───────────────────────────────────────────────────────────
    async function handleSubmit() {
        if (!validRows.length) return
        setRunning(true)
        const tracked = rows.map(r => r.title.trim() ? { ...r, importStatus: 'pending' as const } : r)
        setRows(tracked)
        const toRun = tracked.filter(r => r.importStatus === 'pending')
        for (let i = 0; i < toRun.length; i++) {
            setCurrentIdx(i)
            const t = toRun[i]
            try {
                await addSingleTaskJson({ eventId, title: t.title, description: t.description || null, department: t.department, deadline: t.deadline || null, status: t.status, assigneeIds: t.assigneeId ? [t.assigneeId] : [] })
                setRows(prev => prev.map(r => r.id === t.id ? { ...r, importStatus: 'success' } : r))
            } catch (e: any) {
                setRows(prev => prev.map(r => r.id === t.id ? { ...r, importStatus: 'error', errorMsg: e.message } : r))
            }
        }
        setRunning(false)
        setDone(true)
        router.refresh()
    }

    // ── CSV file ─────────────────────────────────────────────────────────
    function handleFile(file: File) {
        setCsvError('')
        const reader = new FileReader()
        reader.onload = e => {
            const parsed = csvToRows(e.target?.result as string, teamMembers)
            if (!parsed.length) { setCsvError('No valid tasks found. Check the file has a Title column.'); return }
            setRows(parsed)
            setTab('form')
        }
        reader.readAsText(file)
    }

    // ── template download ─────────────────────────────────────────────────
    function downloadTemplate() {
        const csv = [
            ['Title','Description','Department','Due Date','Status','Assignee Name'],
            ['Setup Sound Equipment','Connect the mixer and secondary speakers','Production','2026-07-01 14:00','Requested',''],
            ['Create Social Banners','Resize for FB, Twitter and IG','Graphics','2026-07-02 09:00','Requested',''],
        ].map(r => r.map(c => `"${c.replace(/"/g,'""')}"`).join(',')).join('\n')
        const a = document.createElement('a')
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
        a.download = 'task_request_template.csv'
        a.click()
    }

    function handleClose() {
        if (running) return
        setOpen(false)
        setTimeout(() => { setRows([blankRow()]); setDone(false); setRunning(false); setCurrentIdx(0); setCsvError(''); setTab('form') }, 300)
    }

    const successCount = rows.filter(r => r.importStatus === 'success').length
    const failCount = rows.filter(r => r.importStatus === 'error').length

    return (
        <>
            {/* Trigger */}
            <button onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-bg-subtle hover:bg-bg-elevated border border-border hover:border-border-hover text-text-primary rounded-lg text-xs font-medium transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Task Requests
            </button>

            {open && (
                <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={handleClose}>
                    <div className="bg-bg-elevated border border-border rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

                        {/* ── Header ── */}
                        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
                            <div>
                                <h2 className="text-base font-semibold text-text-primary">Task Request Form</h2>
                                <p className="text-xs text-text-muted mt-0.5">Fill in each task request below, then submit to add them to the project.</p>
                            </div>
                            {!running && (
                                <button onClick={handleClose} className="text-text-muted hover:text-text-primary transition-colors mt-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            )}
                        </div>

                        {/* ── Tabs ── */}
                        {!done && !running && (
                            <div className="flex gap-1 px-6 pt-3 flex-shrink-0">
                                {(['form','csv'] as Tab[]).map(t => (
                                    <button key={t} onClick={() => setTab(t)}
                                        className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === t ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text-secondary'}`}>
                                        {t === 'form' ? '📋 Fill Form' : '📄 Import CSV'}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* ── Body ── */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">

                            {/* ── FORM TAB ── */}
                            {tab === 'form' && !running && !done && (
                                <div className="space-y-3">
                                    {rows.map((row, idx) => (
                                        <div key={row.id} className="bg-bg-subtle/60 border border-border rounded-xl p-4 space-y-3 group relative">
                                            {/* Row number + remove */}
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Task #{idx + 1}</span>
                                                <button onClick={() => removeRow(row.id)}
                                                    className="text-text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100 p-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                </button>
                                            </div>

                                            {/* Title */}
                                            <div>
                                                <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">
                                                    Task Title <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={row.title}
                                                    onChange={e => setRow(row.id, { title: e.target.value })}
                                                    placeholder="e.g. Design event backdrop banner"
                                                    className="input text-sm"
                                                />
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Description</label>
                                                <textarea
                                                    value={row.description}
                                                    onChange={e => setRow(row.id, { description: e.target.value })}
                                                    placeholder="Add details, requirements, references…"
                                                    rows={2}
                                                    className="input text-sm resize-none"
                                                />
                                            </div>

                                            {/* Row 3: dept / deadline / status / assignee */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Department</label>
                                                    <select value={row.department} onChange={e => setRow(row.id, { department: e.target.value })} className="input text-sm appearance-none">
                                                        {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Deadline</label>
                                                    <input type="datetime-local" value={row.deadline} onChange={e => setRow(row.id, { deadline: e.target.value })} className="input text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Status</label>
                                                    <select value={row.status} onChange={e => setRow(row.id, { status: e.target.value })} className="input text-sm appearance-none">
                                                        {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Assign To</label>
                                                    <select value={row.assigneeId} onChange={e => setRow(row.id, { assigneeId: e.target.value })} className="input text-sm appearance-none">
                                                        <option value="">Unassigned</option>
                                                        {teamMembers.map(m => <option key={m.user_id} value={m.user_id}>{m.profiles?.full_name}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add row button */}
                                    <button onClick={addRow}
                                        className="w-full py-3 border-2 border-dashed border-border hover:border-accent/50 hover:bg-accent/5 rounded-xl text-xs font-medium text-text-muted hover:text-accent transition-all flex items-center justify-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                        Add another task
                                    </button>
                                </div>
                            )}

                            {/* ── CSV TAB ── */}
                            {tab === 'csv' && !running && !done && (
                                <div className="space-y-4">
                                    <div
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f?.name.endsWith('.csv')) handleFile(f); else setCsvError('Please drop a .csv file.') }}
                                        onClick={() => fileRef.current?.click()}
                                        className="border-2 border-dashed border-border hover:border-accent/50 hover:bg-accent/5 rounded-xl p-10 text-center cursor-pointer transition-all flex flex-col items-center gap-3">
                                        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-text-primary">Drop your CSV here or click to browse</p>
                                            <p className="text-xs text-text-muted mt-0.5">Columns: Title, Description, Department, Due Date, Status, Assignee Name</p>
                                        </div>
                                    </div>

                                    {csvError && (
                                        <div className="flex items-center gap-2 px-4 py-3 bg-danger/10 border border-danger/20 rounded-lg text-xs text-danger">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                            {csvError}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between bg-bg-subtle/50 border border-border rounded-xl px-4 py-3">
                                        <div>
                                            <p className="text-xs font-medium text-text-primary">Not sure about the format?</p>
                                            <p className="text-[11px] text-text-muted mt-0.5">Download our template — fill it in and upload.</p>
                                        </div>
                                        <button onClick={downloadTemplate}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent hover:text-accent-hover border border-accent/30 hover:border-accent/50 rounded-lg transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                            Template CSV
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── PROCESSING ── */}
                            {running && (
                                <div className="py-8 flex flex-col items-center gap-6">
                                    <div className="relative w-16 h-16 flex items-center justify-center">
                                        <div className="spinner absolute" />
                                        <span className="text-xs font-semibold text-accent font-mono">
                                            {Math.round((currentIdx / validRows.length) * 100)}%
                                        </span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-text-primary">Submitting tasks…</p>
                                        <p className="text-xs text-text-muted mt-1">
                                            {currentIdx + 1} of {validRows.length}: <span className="text-accent font-medium">"{validRows[currentIdx]?.title}"</span>
                                        </p>
                                    </div>
                                    <div className="w-full max-w-sm bg-bg-subtle border border-border h-2 rounded-full overflow-hidden">
                                        <div className="bg-accent h-full rounded-full transition-all duration-300" style={{ width: `${(currentIdx / validRows.length) * 100}%` }} />
                                    </div>
                                </div>
                            )}

                            {/* ── DONE ── */}
                            {done && (
                                <div className="py-8 flex flex-col items-center gap-4">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${failCount ? 'bg-warning/10 border border-warning/30 text-warning' : 'bg-success/10 border border-success/30 text-success'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-base font-semibold text-text-primary">
                                            {successCount} task{successCount !== 1 ? 's' : ''} submitted!
                                        </p>
                                        {failCount > 0 && <p className="text-xs text-danger mt-1">{failCount} failed — see details below.</p>}
                                    </div>
                                    <div className="w-full max-w-md bg-bg-subtle/60 border border-border rounded-xl divide-y divide-border overflow-hidden">
                                        {rows.filter(r => r.importStatus).map(r => (
                                            <div key={r.id} className="flex items-center justify-between px-4 py-2.5 gap-3">
                                                <p className="text-xs text-text-primary truncate">{r.title}</p>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${r.importStatus === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                                    {r.importStatus === 'success' ? 'Done' : `Failed: ${r.errorMsg}`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Footer ── */}
                        <div className="px-6 pb-6 pt-4 border-t border-border flex-shrink-0 flex items-center gap-3">
                            {!running && !done && (
                                <>
                                    <button onClick={handleClose} className="flex-1 py-2.5 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-lg">
                                        Cancel
                                    </button>
                                    {tab === 'form' && (
                                        <button onClick={handleSubmit} disabled={!validRows.length}
                                            className="flex-[3] py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                            Submit {validRows.length > 0 ? `${validRows.length} ` : ''}Task{validRows.length !== 1 ? 's' : ''}
                                        </button>
                                    )}
                                </>
                            )}
                            {done && (
                                <button onClick={handleClose} className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-medium transition-colors">
                                    Done
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
