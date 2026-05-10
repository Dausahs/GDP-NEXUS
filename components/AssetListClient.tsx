'use client'

import { useState } from 'react'
import { returnAsset, checkoutAsset, updateAsset, deleteAsset } from '@/app/actions/assets'

const ASSET_TYPES = ['Camera Body', 'Lens', 'Audio', 'Lighting', 'Grip / Rigging', 'Other']

function EditAssetModal({ asset, onClose }: { asset: any, onClose: () => void }) {
    const [isPending, setIsPending] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        try {
            await updateAsset(formData)
            onClose()
        } catch (e: any) {
            alert(e.message || 'Failed to update equipment.')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-bg-elevated border border-border rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-text-primary">Edit equipment</h2>
                    <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <input type="hidden" name="id" value={asset.id} />

                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">Equipment name</label>
                        <input
                            name="name"
                            required
                            defaultValue={asset.name}
                            className="w-full bg-bg-subtle border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1.5">Category</label>
                            <select
                                name="type"
                                defaultValue={asset.type}
                                className="w-full bg-bg-subtle border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors appearance-none"
                            >
                                {ASSET_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1.5">Serial number</label>
                            <input
                                name="serial_number"
                                defaultValue={asset.serial_number || ''}
                                placeholder="Optional"
                                className="w-full bg-bg-subtle border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors placeholder:text-text-muted"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">Condition</label>
                        <select
                            name="condition"
                            defaultValue={asset.condition || 'Good'}
                            className="w-full bg-bg-subtle border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors appearance-none"
                        >
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                            <option value="Needs Repair">Needs Repair</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isPending}
                            className="flex-[2] bg-accent hover:bg-accent-hover text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                            {isPending ? 'Saving…' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function AssetListClient({ assets, activeEvents, currentUserId, userRole }: {
    assets: any[], activeEvents: any[], currentUserId?: string, userRole?: string
}) {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [editingAsset, setEditingAsset] = useState<any>(null)

    const isMT = userRole === 'MT'

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
            alert(e.message || 'Failed to checkout equipment.')
        } finally {
            setIsPending(false)
        }
    }

    async function handleDelete(asset: any) {
        if (!confirm(`Delete "${asset.name}"? This cannot be undone.`)) return
        const fd = new FormData()
        fd.append('id', asset.id)
        try {
            await deleteAsset(fd)
        } catch (e: any) {
            alert(e.message || 'Failed to delete.')
        }
    }

    return (
        <>
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="px-4 py-3 text-xs font-medium text-text-muted w-10 text-center">—</th>
                                <th className="px-4 py-3 text-xs font-medium text-text-muted">Item</th>
                                <th className="px-4 py-3 text-xs font-medium text-text-muted hidden md:table-cell">Serial</th>
                                <th className="px-4 py-3 text-xs font-medium text-text-muted hidden lg:table-cell">Condition</th>
                                <th className="px-4 py-3 text-xs font-medium text-text-muted">Status</th>
                                <th className="px-4 py-3 text-xs font-medium text-text-muted text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {assets?.map(asset => {
                                const isSelected = selectedIds.includes(asset.id)
                                const isAvailable = asset.status === 'Available'

                                return (
                                    <tr key={asset.id} className={`hover:bg-bg-subtle transition-colors group ${isSelected ? 'bg-accent/5' : ''}`}>
                                        {/* Select checkbox */}
                                        <td className="px-4 py-3 text-center">
                                            {isAvailable ? (
                                                <button
                                                    onClick={() => toggleSelection(asset.id)}
                                                    className={`w-5 h-5 rounded border mx-auto flex items-center justify-center transition-colors ${
                                                        isSelected ? 'bg-accent border-accent' : 'border-border hover:border-border-hover'
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

                                        {/* Name + type */}
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-text-primary truncate max-w-[180px]">{asset.name}</p>
                                            <p className="text-[10px] text-text-muted">{asset.type}</p>
                                        </td>

                                        {/* Serial */}
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="text-xs text-text-muted font-mono">{asset.serial_number || '—'}</span>
                                        </td>

                                        {/* Condition */}
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            {asset.condition ? (
                                                <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md ${
                                                    asset.condition === 'Good'
                                                    ? 'bg-green-500/10 text-green-400'
                                                    : asset.condition === 'Fair'
                                                    ? 'bg-amber-500/10 text-amber-400'
                                                    : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                    {asset.condition}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-text-muted">—</span>
                                            )}
                                        </td>

                                        {/* Status */}
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

                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* Return — visible to borrower or MT */}
                                                {!isAvailable && (currentUserId === asset.current_user_id || isMT) && (
                                                    <form action={returnAsset}>
                                                        <input type="hidden" name="assetId" value={asset.id} />
                                                        <button type="submit"
                                                            className="px-2.5 py-1 text-xs font-medium text-text-secondary border border-border rounded-md hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30 transition-colors">
                                                            Return
                                                        </button>
                                                    </form>
                                                )}

                                                {/* Edit — MT only */}
                                                {isMT && (
                                                    <button
                                                        onClick={() => setEditingAsset(asset)}
                                                        className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Edit"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                    </button>
                                                )}

                                                {/* Delete — MT only */}
                                                {isMT && (
                                                    <button
                                                        onClick={() => handleDelete(asset)}
                                                        className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Delete"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                                    </button>
                                                )}
                                            </div>
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

            {/* Floating checkout bar */}
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
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={() => setIsCheckoutModalOpen(false)}>
                    <div className="bg-bg-elevated border border-border rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-base font-semibold text-text-primary">Check out equipment</h2>
                                <p className="text-xs text-text-secondary mt-0.5">{selectedIds.length} items selected</p>
                            </div>
                            <button onClick={() => setIsCheckoutModalOpen(false)} className="text-text-muted hover:text-text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>

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
                                <select name="eventId" required
                                    className="w-full bg-bg-subtle border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors appearance-none">
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

            {/* Edit modal */}
            {editingAsset && (
                <EditAssetModal asset={editingAsset} onClose={() => setEditingAsset(null)} />
            )}
        </>
    )
}
