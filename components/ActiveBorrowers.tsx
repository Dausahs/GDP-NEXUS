// components/ActiveBorrowers.tsx
import React from 'react'

export default function ActiveBorrowers({ assets }: { assets: any[] }) {
    const inUseAssets = assets.filter(a => a.status === 'In Use')

    // Group assets by borrower (current_user_id)
    const groupedByBorrower = inUseAssets.reduce((acc: any, asset: any) => {
        const userId = asset.current_user_id || 'unknown'
        if (!acc[userId]) {
            acc[userId] = {
                user: asset.profiles,
                items: [],
                projects: new Set()
            }
        }
        acc[userId].items.push(asset)
        if (asset.events?.title) acc[userId].projects.add(asset.events.title)
        return acc
    }, {})

    const borrowersList = Object.values(groupedByBorrower)

    if (borrowersList.length === 0) return (
        <div className="p-12 text-center glass rounded-[2rem] border border-white/5">
            <p className="text-xs font-mono text-white/20 uppercase tracking-widest">No active checkouts detected</p>
        </div>
    )

    return (
        <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="p-6 text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">Name</th>
                            <th className="p-6 text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">Project(s)</th>
                            <th className="p-6 text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">Items In Use</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {borrowersList.map((group: any, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-6 align-top">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-cyan-neon/10 border border-cyan-neon/20 flex items-center justify-center text-[10px] font-bold text-cyan-neon">
                                            {group.user?.full_name?.charAt(0) || '?'}
                                        </div>
                                        <span className="text-sm font-bold text-white">{group.user?.full_name || 'Unknown'}</span>
                                    </div>
                                </td>
                                <td className="p-6 align-top">
                                    <div className="flex flex-col gap-1">
                                        {Array.from(group.projects).map((proj: any, pIdx) => (
                                            <span key={pIdx} className="text-xs font-medium text-white/60">{proj}</span>
                                        ))}
                                        {group.projects.size === 0 && <span className="text-xs font-medium text-white/20 italic">No project assigned</span>}
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="space-y-4">
                                        {group.items.map((asset: any) => (
                                            <div key={asset.id} className="flex flex-col">
                                                <span className="text-xs font-bold text-cyan-neon/80 uppercase tracking-wide">{asset.name}</span>
                                                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{asset.serial_number || 'No Serial'}</span>
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
