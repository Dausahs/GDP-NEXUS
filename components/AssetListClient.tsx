// components/AssetGridClient.tsx
'use client'

import { useState } from 'react'
import { returnAsset, checkoutAsset } from '@/app/actions/assets'

export default function AssetListClient({ assets, activeEvents, currentUserId, userRole }: { assets: any[], activeEvents: any[], currentUserId?: string, userRole?: string }) {
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
            console.error(e)
            alert(e.message || "Failed to checkout gear.")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <>
            <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="p-6 text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] w-16 text-center">Select</th>
                                <th className="p-6 text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">Item / Type</th>
                                <th className="p-6 text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] hidden md:table-cell">Serial Number</th>
                                <th className="p-6 text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">Status</th>
                                <th className="p-6 text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {assets?.map(asset => {
                                const isSelected = selectedIds.includes(asset.id)
                                const isAvailable = asset.status === 'Available'

                                return (
                                    <tr 
                                        key={asset.id} 
                                        className={`group hover:bg-white/[0.02] transition-colors ${isSelected ? 'bg-cyan-neon/[0.03]' : ''}`}
                                    >
                                        <td className="p-6 text-center">
                                            {isAvailable ? (
                                                <button 
                                                    onClick={() => toggleSelection(asset.id)}
                                                    className={`w-6 h-6 rounded-lg border-2 mx-auto flex items-center justify-center transition-all duration-300 ${
                                                        isSelected 
                                                        ? 'bg-cyan-neon border-cyan-neon shadow-[0_0_15px_rgba(0,245,255,0.4)]' 
                                                        : 'border-white/10 group-hover:border-white/30'
                                                    }`}
                                                >
                                                    {isSelected && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                </button>
                                            ) : (
                                                <div className="w-6 h-6 mx-auto flex items-center justify-center opacity-10">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white group-hover:text-cyan-neon transition-colors truncate max-w-[200px]">{asset.name}</span>
                                                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest mt-1">{asset.type}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 hidden md:table-cell">
                                            <span className="text-xs font-mono text-white/40 uppercase tracking-widest">{asset.serial_number || 'N/A'}</span>
                                        </td>
                                        <td className="p-6">
                                            {isAvailable ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                                                    <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">Available</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div>
                                                        <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">In Use</span>
                                                    </div>
                                                    <span className="text-[9px] text-white/30 truncate max-w-[150px]">
                                                        {asset.profiles?.full_name} @ {asset.events?.title}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-6 text-right">
                                            {!isAvailable && (currentUserId === asset.current_user_id || userRole === 'admin') && (
                                                <form action={returnAsset}>
                                                    <input type="hidden" name="assetId" value={asset.id} />
                                                    <button 
                                                        type="submit" 
                                                        className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-500 transition-all active:scale-95"
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
                </div>

                {(!assets || assets.length === 0) && (
                    <div className="py-24 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/10"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                        </div>
                        <h3 className="text-lg font-display font-bold text-white mb-2">No items found</h3>
                        <p className="text-xs text-white/30 max-w-xs mx-auto">The inventory is currently empty. Add equipment to begin tracking.</p>
                    </div>
                )}
            </div>

            {/* Floating Command Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-10 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 bg-zinc-900/90 border border-white/10 backdrop-blur-3xl px-8 py-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-12 z-50 animate-in slide-in-from-bottom-20 fade-in duration-500">
                    <div className="flex items-center gap-4">
                        <div className="bg-cyan-neon text-black px-3 py-1 rounded-lg text-xs font-mono font-black shadow-[0_0_15px_rgba(0,245,255,0.4)]">
                            {selectedIds.length}
                        </div>
                        <span className="font-display font-bold text-xs text-white uppercase tracking-widest hidden sm:inline">
                            Items Selected
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSelectedIds([])}
                            className="text-[10px] font-mono font-bold text-white/30 hover:text-white uppercase tracking-widest transition-colors px-4"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => setIsCheckoutModalOpen(true)}
                            className="bg-cyan-neon text-black px-8 py-3 rounded-xl font-display font-bold text-[11px] uppercase tracking-widest hover:scale-[1.05] active:scale-95 transition-all"
                        >
                            Check Out
                        </button>
                    </div>
                </div>
            )}

            {/* Checkout Protocol Modal */}
            {isCheckoutModalOpen && (
                <div 
                    className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl"
                    onClick={() => setIsCheckoutModalOpen(false)}
                >
                    <div 
                        className="glass rounded-[3rem] max-w-xl w-full p-10 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 bg-cyan-neon rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,245,255,0.4)]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Equipment Check Out</h2>
                                <p className="text-[10px] font-mono text-cyan-neon uppercase tracking-[0.2em]">Checking out {selectedIds.length} items</p>
                            </div>
                        </div>
                        
                        <div className="mb-10 max-h-40 overflow-y-auto custom-scrollbar border border-white/5 rounded-2xl p-4 bg-white/5 space-y-3">
                            {assets.filter(a => selectedIds.includes(a.id)).map(asset => (
                                <div key={asset.id} className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-cyan-neon rounded-full"></div>
                                    <span className="text-xs font-bold text-white/60 uppercase tracking-wider">{asset.name}</span>
                                </div>
                            ))}
                        </div>

                        <form action={handleBulkCheckout} className="space-y-8">
                            {selectedIds.map(id => (
                                <input key={id} type="hidden" name="assetIds" value={id} />
                            ))}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Assigned Project</label>
                                <select 
                                    name="eventId" 
                                    required 
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-cyan-neon transition-all appearance-none cursor-pointer font-medium"
                                >
                                    <option value="" className="bg-[#161B22]">Select Project...</option>
                                    {activeEvents.map(e => (
                                        <option key={e.id} value={e.id} className="bg-[#161B22]">{e.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col md:flex-row gap-4 pt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setIsCheckoutModalOpen(false)} 
                                    className="flex-1 px-8 py-4 rounded-2xl font-mono font-bold text-[11px] text-white/30 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest order-2 md:order-1"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isPending} 
                                    className="flex-[2] bg-cyan-neon text-black px-8 py-4 rounded-2xl font-display font-bold text-sm shadow-[0_0_30px_rgba(0,245,255,0.4)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed order-1 md:order-2"
                                >
                                    {isPending ? 'CHECKING OUT...' : 'CONFIRM CHECK OUT'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
