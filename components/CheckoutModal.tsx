// components/CheckoutModal.tsx
'use client'

import { useState } from 'react'
import { checkoutAsset } from '@/app/actions/assets'

export default function CheckoutModal({ asset, activeEvents }: { asset: any, activeEvents: any[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        try {
            await checkoutAsset(formData)
            setIsOpen(false)
        } catch (e: any) {
            console.error(e)
            alert(e.message || "Failed to checkout gear.")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)} 
                className="w-full py-4 bg-white/5 border border-white/10 text-white/60 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-cyan-neon hover:text-black hover:border-cyan-neon transition-all active:scale-95 shadow-sm"
            >
                Checkout Unit
            </button>
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl"
                    onClick={() => setIsOpen(false)}
                >
                    <div 
                        className="glass rounded-[3rem] max-w-xl w-full p-10 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* HUD Header */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-cyan-neon rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,245,255,0.4)]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight leading-tight">Checkout Protocol</h2>
                                <p className="text-[10px] font-mono text-cyan-neon uppercase tracking-[0.2em]">{asset.name}</p>
                            </div>
                        </div>

                        <form action={handleSubmit} className="space-y-8">
                            <input type="hidden" name="assetIds" value={asset.id} />
                            
                            <div className="space-y-2">
                                <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Target Operation</label>
                                <select 
                                    name="eventId" 
                                    required 
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-cyan-neon transition-all appearance-none cursor-pointer font-medium"
                                >
                                    <option value="" className="bg-[#161B22]">Select Mission...</option>
                                    {activeEvents.map(e => (
                                        <option key={e.id} value={e.id} className="bg-[#161B22]">{e.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 pt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setIsOpen(false)} 
                                    disabled={isPending} 
                                    className="flex-1 px-8 py-4 rounded-2xl font-mono font-bold text-[11px] text-white/30 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest order-2 md:order-1"
                                >
                                    Abort
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isPending} 
                                    className="flex-[2] bg-cyan-neon text-black px-8 py-4 rounded-2xl font-display font-bold text-sm shadow-[0_0_30px_rgba(0,245,255,0.4)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed order-1 md:order-2"
                                >
                                    {isPending ? 'PROCESSING...' : 'INITIATE DEPLOY'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
