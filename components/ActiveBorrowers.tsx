'use client'

// components/ActiveBorrowers.tsx
import React, { useState, useTransition } from 'react'
import { returnAllAssets } from '@/app/actions/assets'

export default function ActiveBorrowers({ assets, currentUserId, userRole }: {
    assets: any[]
    currentUserId?: string
    userRole?: string
}) {
    const inUseAssets = assets.filter(a => a.status === 'In Use')
    const isMT = userRole === 'MT'

    const groupedByBorrower = inUseAssets.reduce((acc: any, asset: any) => {
        const userId = asset.current_user_id || 'unknown'
        if (!acc[userId]) {
            acc[userId] = { userId, user: asset.profiles, items: [], projects: new Set() }
        }
        acc[userId].items.push(asset)
        if (asset.events?.title) acc[userId].projects.add(asset.events.title)
        return acc
    }, {})

    const borrowersList = Object.values(groupedByBorrower) as any[]

    if (borrowersList.length === 0) return (
        <div className="card px-4 py-10 text-center">
            <p className="text-sm text-text-muted">No active checkouts</p>
        </div>
    )

    return (
        <div className="card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="px-3 md:px-4 py-3 text-xs font-medium text-text-muted">Member</th>
                            <th className="px-3 md:px-4 py-3 text-xs font-medium text-text-muted hidden sm:table-cell">Project(s)</th>
                            <th className="px-3 md:px-4 py-3 text-xs font-medium text-text-muted">Items</th>
                            <th className="px-3 md:px-4 py-3 text-xs font-medium text-text-muted text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {borrowersList.map((group: any, idx: number) => {
                            const canReturn = isMT || group.userId === currentUserId
                            return (
                                <BorrowerRow key={idx} group={group} canReturn={canReturn} />
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function BorrowerRow({ group, canReturn }: { group: any; canReturn: boolean }) {
    const [isPending, startTransition] = useTransition()
    const [done, setDone] = useState(false)

    function handleReturnAll() {
        startTransition(async () => {
            const fd = new FormData()
            group.items.forEach((asset: any) => fd.append('assetIds', asset.id))
            try {
                await returnAllAssets(fd)
                setDone(true)
            } catch (e: any) {
                alert(e.message || 'Failed to return items.')
            }
        })
    }

    if (done) return null

    return (
        <tr className="hover:bg-bg-subtle transition-colors">
            <td className="px-3 md:px-4 py-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-xs font-semibold text-accent flex-shrink-0">
                        {group.user?.full_name?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm font-medium text-text-primary">{group.user?.full_name || 'Unknown'}</span>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex flex-col gap-0.5">
                    {Array.from(group.projects).map((proj: any, pIdx: number) => (
                        <span key={pIdx} className="text-xs text-text-secondary">{proj}</span>
                    ))}
                    {group.projects.size === 0 && <span className="text-xs text-text-muted italic">No project</span>}
                </div>
            </td>
            <td className="px-3 md:px-4 py-3 hidden sm:table-cell">
                <div className="space-y-1">
                    {group.items.map((asset: any) => (
                        <div key={asset.id}>
                            <p className="text-xs font-medium text-text-primary">{asset.name}</p>
                            {asset.serial_number && (
                                <p className="text-[10px] text-text-muted">{asset.serial_number}</p>
                            )}
                        </div>
                    ))}
                </div>
            </td>
            <td className="px-3 md:px-4 py-3 text-right">
                {canReturn && (
                    <button
                        onClick={handleReturnAll}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-md transition-colors disabled:opacity-50
                            text-text-secondary border-border hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30"
                    >
                        {isPending ? (
                            <>
                                <div className="w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin" />
                                Returning…
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                </svg>
                                Return all ({group.items.length})
                            </>
                        )}
                    </button>
                )}
            </td>
        </tr>
    )
}
