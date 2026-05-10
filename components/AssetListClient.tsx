// components/AssetListClient.tsx
'use client'

import { useState } from 'react'
import { returnAsset, checkoutAsset } from '@/app/actions/assets'

export default function AssetListClient({ assets, activeEvents, currentUserId, userRole }: {
    assets: any[], activeEvents: any[], currentUserId?: string, userRole?: string
}) {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    async function handleBulkCheckout(formData: FormData) {
        setIsPending(true)
        try {
            await checkoutAsset(formData)
            setIsCheckoutModalOpen(false)
            setSelectedIds([])
        } catch (e: any) {
            alert(e.message || 'Failed to checkout gear.')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <>
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="px-4 py-3 text-xs font-medium text-text-muted w-12 text-center">—</th>
                                <th className="px-4 py-3 text-xs font-medium text-text-muted">Item</th>
                                <th className="px-4 py-3 text-xs font-medium text-text-muted hidden md:table-cell">Serial</th>
                                <th className="px-4 py-3 text-xs font-medium text-text-muted">Status</th>
                                <th className="px-4 py-3 text-xs font-medium text-text-muted text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {assets?.map(asset => {
                                const isSelected = selectedIds.includes(asset.id)
                                const isAvailable = asset.status === 'Available'

                                return (
                                    <tr key={asset.id} className={`hover:bg-bg-subtle transition-colors group ${isSelected ? 'bg-accent/5' : ''}`}>
                                        <td className="px-4 py-3 text-center">
                                            {isAvailable ? (
                                                <button
                                                    onClick={() => toggleSelection(asset.id)}
                                                    className={`w-5 h-5 rounded border mx-auto flex items-center justify-center transition-colors ${
                                                        isSelected
                                                        ? 'bg-accent border-accent'
                                                        : 'border-border hover:border-border-hover'
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                    )}
                                                </button>
                                            ) : (
                                                <div className="w-5 h-5 rounded border border-border/40 mx-auto opacity-30" />
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-text-primary group-hover:text-accent transition-colors truncate max-w-[200px]">{asset.name}</p>
                                            <p className="text-[10px] text-text-muted">{asset.type}</p>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="text-xs text-text-muted font-mono">{asset.serial_number || '—'}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {isAvailable ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                                    Available
                                                </span>
                                            ) : (
                                                <div>
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                        In use
                                                    </span>
                                                    <p className="text-[10px] text-text-muted truncate max-w-[140px] mt-0.5">
                                                        {asset.profiles?.full_name}
                                                    </p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {!isAvailable && (currentUserId === asset.current_user_id || userRole === 'admin') && (
                                                <form action={returnAsset}>
                                                    <input type="hidden" name="assetId" value={asset.id} />
                                                    <button
                                                        type="submit"
                                                        className="px-3 py-1 text-xs font-medium text-text-secondary border border-border rounded-md hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30 transition-colors"
                                                    >
                                                        Return
                                                    </button>
                                                </form>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                    {(!assets || assets.length === 0) && (
                        <div className="py-16 text-center">
                            <p className="text-sm text-text-muted">No equipment found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-bg-elevated border border-border shadow-2xl rounded-xl px-5 py-3.5 flex items-center gap-6 z-50">
                    <span className="text-sm font-medium text-text-primary">{selectedIds.length} selected</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedIds([])} className="text-xs text-text-muted hover:text-text-secondary transition-colors px-3 py-1.5">
                            Clear
                        </button>
                        <button
                            onClick={() => setIsCheckoutModalOpen(true)}
                            className="bg-accent hover:bg-accent-hover text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        >
                            Check out
                        </button>
                    </div>
                </div>
            )}

            {/* Checkout modal */}
            {isCheckoutModalOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
                    onClick={() => setIsCheckoutModalOpen(false)}
                >
                    <div
                        className="bg-bg-elevated border border-border rounded-xl max-w-md w-full p-6 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-base font-semibold text-text-primary">Check out equipment</h2>
                                <p className="text-xs text-text-secondary mt-0.5">{selectedIds.length} items selected</p>
                            </div>
                            <button onClick={() => setIsCheckoutModalOpen(false)} className="text-text-muted hover:text-text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>

                        {/* Selected items list */}
                        <div className="bg-bg-subtle border border-border rounded-lg p-3 mb-5 max-h-36 overflow-y-auto custom-scrollbar space-y-1.5">
                            {assets.filter(a => selectedIds.includes(a.id)).map(asset => (
                                <div key={asset.id} className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                                    <span className="text-xs text-text-secondary">{asset.name}</span>
                                </div>
                            ))}
                        </div>

                        <form action={handleBulkCheckout} className="space-y-4">
                            {selectedIds.map(id => <input key={id} type="hidden" name="assetIds" value={id} />)}
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1.5">Assign to project</label>
                                <select
                                    name="eventId"
                                    required
                                    className="w-full bg-bg-subtle border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors appearance-none"
                                >
                                    <option value="">Select project…</option>
                                    {activeEvents.map(e => (
                                        <option key={e.id} value={e.id}>{e.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsCheckoutModalOpen(false)}
                                    className="flex-1 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isPending}
                                    className="flex-[2] bg-accent hover:bg-accent-hover text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                                    {isPending ? 'Checking out…' : 'Confirm checkout'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
