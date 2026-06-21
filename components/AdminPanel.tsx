'use client'

import { useState, useTransition, useRef } from 'react'
import { createUserAccount, deleteUserAccount } from '@/app/actions/admin'
import Link from 'next/link'

type User = {
    id: string
    full_name: string
    role: string
    email: string
}

const ROLES = [
    { value: 'MT', label: 'MT', description: 'Media Team — full access' },
    { value: 'Penyelaras', label: 'Penyelaras', description: 'Coordinator — limited access' },
    { value: 'organizer', label: 'Organizer', description: 'Event organizer' },
]

const ROLE_COLORS: Record<string, string> = {
    MT: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    Penyelaras: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    organizer: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
}

export default function AdminPanel({ users: initialUsers, listError }: { users: User[]; listError: string | null }) {
    const [users, setUsers] = useState<User[]>(initialUsers)
    const [isPending, startTransition] = useTransition()
    const [formError, setFormError] = useState<string | null>(null)
    const [formSuccess, setFormSuccess] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

    function handleCreate(formData: FormData) {
        setFormError(null)
        setFormSuccess(null)
        startTransition(async () => {
            const result = await createUserAccount(formData)
            if (result.error) {
                setFormError(result.error)
            } else {
                setFormSuccess('Account created successfully.')
                formRef.current?.reset()
                setShowForm(false)
                // Re-fetch optimistic update
                const newUser: User = {
                    id: result.userId!,
                    full_name: formData.get('full_name') as string,
                    role: formData.get('role') as string,
                    email: formData.get('email') as string,
                }
                setUsers(prev => [...prev, newUser].sort((a, b) => a.full_name.localeCompare(b.full_name)))
            }
        })
    }

    function handleDelete(userId: string) {
        startTransition(async () => {
            const result = await deleteUserAccount(userId)
            if (result.error) {
                setFormError(result.error)
            } else {
                setUsers(prev => prev.filter(u => u.id !== userId))
                setDeleteConfirm(null)
            }
        })
    }

    return (
        <div className="min-h-screen bg-bg text-text-primary page-enter">
            {/* Header */}
            <header className="border-b border-border bg-bg-elevated px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <div>
                        <span className="font-display font-semibold text-sm text-text-primary tracking-tight">GDP Nexus</span>
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-accent/15 text-accent border border-accent/20 rounded font-mono uppercase tracking-wider">Admin</span>
                    </div>
                </div>
                <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                    Back to Dashboard
                </Link>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">

                {/* Page title */}
                <div>
                    <h1 className="font-display text-2xl font-semibold text-text-primary">User Management</h1>
                    <p className="text-sm text-text-muted mt-1">Create and manage team accounts. Restricted to administrators only.</p>
                </div>

                {/* Global success banner */}
                {formSuccess && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        {formSuccess}
                    </div>
                )}

                {/* Global error banner */}
                {formError && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        {formError}
                    </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                    {ROLES.map(r => {
                        const count = users.filter(u => u.role === r.value).length
                        return (
                            <div key={r.value} className="card p-4">
                                <p className="text-xs text-text-muted mb-1">{r.label}</p>
                                <p className="font-display text-2xl font-semibold text-text-primary">{count}</p>
                                <p className="text-[10px] text-text-muted mt-0.5">{r.description}</p>
                            </div>
                        )
                    })}
                </div>

                {/* Create user section */}
                <section className="card">
                    <div
                        className="flex items-center justify-between px-5 py-4 cursor-pointer"
                        onClick={() => setShowForm(f => !f)}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-accent/15 rounded-md flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-text-primary">Create New Account</span>
                        </div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className={`text-text-muted transition-transform duration-200 ${showForm ? 'rotate-180' : ''}`}
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>

                    {showForm && (
                        <div className="px-5 pb-5 border-t border-border">
                            <form ref={formRef} action={handleCreate} className="pt-5 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-text-secondary mb-1.5" htmlFor="admin-full-name">
                                            Full Name
                                        </label>
                                        <input
                                            id="admin-full-name"
                                            name="full_name"
                                            type="text"
                                            required
                                            placeholder="Ahmad Firdaus"
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-text-secondary mb-1.5" htmlFor="admin-email">
                                            Email Address
                                        </label>
                                        <input
                                            id="admin-email"
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="user@example.com"
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-text-secondary mb-1.5" htmlFor="admin-password">
                                            Password
                                        </label>
                                        <input
                                            id="admin-password"
                                            name="password"
                                            type="password"
                                            required
                                            minLength={8}
                                            placeholder="Min. 8 characters"
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-text-secondary mb-1.5" htmlFor="admin-role">
                                            Role / Access Level
                                        </label>
                                        <select id="admin-role" name="role" required className="input appearance-none">
                                            <option value="">Select a role…</option>
                                            {ROLES.map(r => (
                                                <option key={r.value} value={r.value}>
                                                    {r.label} — {r.description}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Role guide */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {ROLES.map(r => (
                                        <span key={r.value} className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border ${ROLE_COLORS[r.value]}`}>
                                            <span className="font-medium">{r.label}</span>
                                            <span className="opacity-70">— {r.description}</span>
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors"
                                    >
                                        {isPending ? (
                                            <>
                                                <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                                                Creating…
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                                Create Account
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </section>

                {/* Users table */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                            All Accounts
                        </h2>
                        <span className="text-xs text-text-muted">{users.length} user{users.length !== 1 ? 's' : ''}</span>
                    </div>

                    {listError && (
                        <p className="text-sm text-red-400 mb-4">Failed to load users: {listError}</p>
                    )}

                    <div className="card overflow-hidden">
                        {users.length === 0 ? (
                            <div className="py-16 text-center">
                                <p className="text-sm text-text-muted">No accounts found. Create one above.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {/* Table header */}
                                <div className="grid grid-cols-[1fr_1.5fr_auto_auto] gap-4 px-5 py-2.5">
                                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Name</span>
                                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Email</span>
                                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Role</span>
                                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider"></span>
                                </div>

                                {users.map(u => (
                                    <div key={u.id} className="grid grid-cols-[1fr_1.5fr_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-bg-subtle transition-colors">
                                        <span className="text-sm font-medium text-text-primary truncate">{u.full_name}</span>
                                        <span className="text-sm text-text-secondary truncate font-mono text-xs">{u.email}</span>
                                        <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium whitespace-nowrap ${ROLE_COLORS[u.role] ?? 'bg-bg-subtle text-text-muted border-border'}`}>
                                            {u.role}
                                        </span>

                                        {deleteConfirm === u.id ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    disabled={isPending}
                                                    className="text-[11px] px-2.5 py-1 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-md transition-colors disabled:opacity-50"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(null)}
                                                    className="text-[11px] px-2.5 py-1 text-text-muted hover:text-text-secondary transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setDeleteConfirm(u.id)}
                                                className="p-1.5 rounded-md text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="Delete user"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    )
}
