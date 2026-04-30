// components/AssetLedger.tsx
import { formatDistanceToNow } from 'date-fns'

export default function AssetLedger({ logs }: { logs: any[] }) {
    if (!logs || logs.length === 0) return null

    return (
        <div className="bg-transparent overflow-hidden">
            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                {logs.map(log => (
                    <div key={log.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors group">
                        <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                                log.action === 'Checkout' 
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                            }`}>
                                {log.action === 'Checkout' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                                )}
                            </div>
                            
                            <div>
                                <div className="flex items-center flex-wrap gap-2 mb-2">
                                    <span className="text-sm font-bold text-white group-hover:text-cyan-neon transition-colors tracking-tight">
                                        {log.profiles?.full_name || 'Team Member'}
                                    </span>
                                    <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                                        log.action === 'Checkout' ? 'text-amber-500 bg-amber-500/5' : 'text-emerald-500 bg-emerald-500/5'
                                    }`}>
                                        {log.action === 'Checkout' ? 'CHECKED OUT' : 'RETURNED'}
                                    </span>
                                    <span className="text-sm font-bold text-white/90">
                                        {log.assets?.name || 'Unknown Item'}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-4 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                                    {log.events?.title && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                            <span>PROJECT: {log.events.title}</span>
                                        </div>
                                    )}
                                    {log.assets?.serial_number && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                            <span>SERIAL: {log.assets.serial_number}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 justify-end">
                            <div className="text-right">
                                <p className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest mb-1">Timestamp</p>
                                <p className="text-xs font-bold text-white/40 group-hover:text-white/60 transition-colors">
                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/10 translate-x-4 group-hover:translate-x-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
