// components/ActiveBorrowers.tsx
import React from 'react'

export default function ActiveBorrowers({ assets }: { assets: any[] }) {
    const inUseAssets = assets.filter(a => a.status === 'In Use')

    const groupedByBorrower = inUseAssets.reduce((acc: any, asset: any) => {
        const userId = asset.current_user_id || 'unknown'
        if (!acc[userId]) {
            acc[userId] = { user: asset.profiles, items: [], projects: new Set() }
        }
        acc[userId].items.push(asset)
        if (asset.events?.title) acc[userId].projects.add(asset.events.title)
        return acc
    }, {})

    const borrowersList = Object.values(groupedByBorrower)

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
                            <th className="px-4 py-3 text-xs font-medium text-text-muted">Member</th>
                            <th className="px-4 py-3 text-xs font-medium text-text-muted">Project(s)</th>
                            <th className="px-4 py-3 text-xs font-medium text-text-muted">Items</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {borrowersList.map((group: any, idx) => (
                            <tr key={idx} className="hover:bg-bg-subtle transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-xs font-semibold text-accent flex-shrink-0">
                                            {group.user?.full_name?.charAt(0) || '?'}
                                        </div>
                                        <span className="text-sm font-medium text-text-primary">{group.user?.full_name || 'Unknown'}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col gap-0.5">
                                        {Array.from(group.projects).map((proj: any, pIdx) => (
                                            <span key={pIdx} className="text-xs text-text-secondary">{proj}</span>
                                        ))}
                                        {group.projects.size === 0 && <span className="text-xs text-text-muted italic">No project</span>}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
