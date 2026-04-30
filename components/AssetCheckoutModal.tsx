// components/AssetCheckoutModal.tsx
'use client'

import { checkoutAsset } from '@/app/actions/assets'

export default function AssetCheckoutModal({ asset, assignedEvents, user }: { asset: any, assignedEvents: any[], user: any }) {
    return (
        <div className="glass rounded-[2rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            {/* HUD Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-cyan-neon rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,245,255,0.4)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                    <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight leading-tight">Borrow Unit</h2>
                    <p className="text-[10px] font-mono text-cyan-neon uppercase tracking-[0.2em]">{asset.name}</p>
                </div>
            </div>

            <form action={checkoutAsset} className="space-y-8">
                <input type="hidden" name="assetIds" value={asset.id} />
                <input type="hidden" name="userId" value={user.id} />

                <div className="space-y-2">
                    <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Mission Designation</label>
                    <select 
                        name="eventId" 
                        required 
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-cyan-neon transition-all appearance-none cursor-pointer font-medium"
                    >
                        <option value="" className="bg-[#161B22]">Select Operation...</option>
                        {assignedEvents.map((event) => (
                            <option key={event.id} value={event.id} className="bg-[#161B22]">
                                {event.title}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    className="w-full bg-cyan-neon text-black py-4 rounded-2xl font-display font-bold text-xs shadow-[0_0_30px_rgba(0,245,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                >
                    Initiate Deployment
                </button>
            </form>
        </div>
    )
}