// components/AddAssetModal.tsx
'use client'

import { useState } from 'react'
import { addAsset } from '@/app/actions/assets'

export default function AddAssetModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        try {
            await addAsset(formData)
            setIsOpen(false)
        } catch (e) {
            console.error(e)
            alert("Failed to add gear.")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)} 
                className="bg-cyan-neon text-black px-8 py-4 rounded-2xl font-display font-bold text-sm hover:scale-[1.05] active:scale-95 transition-all shadow-[0_0_30px_rgba(0,245,255,0.2)] flex items-center gap-3 uppercase tracking-widest"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Equipment
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
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 bg-cyan-neon rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,245,255,0.4)]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Equipment Entry</h2>
                                <p className="text-[10px] font-mono text-cyan-neon uppercase tracking-[0.2em]">New Equipment Details</p>
                            </div>
                        </div>

                        <form action={handleSubmit} className="space-y-8">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Equipment Name</label>
                                <input 
                                    name="name" 
                                    required 
                                    autoFocus 
                                    placeholder="Enter asset name..." 
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-cyan-neon transition-all placeholder:text-white/10 font-medium" 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Category</label>
                                    <select 
                                        name="type" 
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-cyan-neon transition-all appearance-none cursor-pointer font-medium"
                                    >
                                        <option value="Body" className="bg-[#161B22]">Camera Body</option>
                                        <option value="Lens" className="bg-[#161B22]">Lens</option>
                                        <option value="Audio" className="bg-[#161B22]">Audio</option>
                                        <option value="Lighting" className="bg-[#161B22]">Lighting</option>
                                        <option value="Grip" className="bg-[#161B22]">Grip/Rigging</option>
                                        <option value="Misc" className="bg-[#161B22]">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Serial Number</label>
                                    <input 
                                        name="serial_number" 
                                        placeholder="Optional..." 
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-cyan-neon transition-all placeholder:text-white/10 font-medium" 
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 pt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setIsOpen(false)} 
                                    className="flex-1 px-8 py-4 rounded-2xl font-mono font-bold text-[11px] text-white/30 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest order-2 md:order-1"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isPending} 
                                    className="flex-[2] bg-cyan-neon text-black px-8 py-4 rounded-2xl font-display font-bold text-sm shadow-[0_0_30px_rgba(0,245,255,0.4)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed order-1 md:order-2"
                                >
                                    {isPending ? 'Processing...' : 'Add Equipment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
