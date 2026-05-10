// components/AssetLedger.tsx
import { formatDistanceToNow } from 'date-fns'

export default function AssetLedger({ logs }: { logs: any[] }) {
    if (!logs || logs.length === 0) return null

    return (
        <div className="divide-y divide-border max-h-[500px] overflow-y-auto custom-scrollbar">
            {logs.map(log => (
                <div key={log.id} className="px-4 py-3.5 flex items-center justify-between gap-4 hover:bg-bg-subtle transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                            log.action === 'Checkout'
                            ? 'bg-amber-400/10 text-amber-400'
                            : 'bg-green-500/10 text-green-400'
                        }`}>
                            {log.action === 'Checkout' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-text-primary">{log.profiles?.full_name || 'Team member'}</span>
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                    log.action === 'Checkout' ? 'text-amber-400 bg-amber-400/8' : 'text-green-400 bg-green-500/8'
                                }`}>
                                    {log.action === 'Checkout' ? 'checked out' : 'returned'}
                                </span>
                                <span className="text-sm text-text-secondary">{log.assets?.name || 'item'}</span>
                            </div>
                            {(log.events?.title || log.assets?.serial_number) && (
                                <p className="text-xs text-text-muted mt-0.5 truncate">
                                    {log.events?.title && `${log.events.title}`}
                                    {log.events?.title && log.assets?.serial_number && ' · '}
                                    {log.assets?.serial_number}
                                </p>
                            )}
                        </div>
                    </div>
                    <span className="text-xs text-text-muted flex-shrink-0">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </span>
                </div>
            ))}
        </div>
    )
}
