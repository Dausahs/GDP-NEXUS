// app/dashboard/assets/page.tsx
import { createClient } from '@/utils/supabase/server'
import AddAssetModal from '@/components/AddAssetModal'
import AssetListClient from '@/components/AssetListClient'
import AssetLedger from '@/components/AssetLedger'
import ActiveBorrowers from '@/components/ActiveBorrowers'

export default async function AssetsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Get user role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    // Fetch Assets with their current event and user
    const { data: assets } = await supabase
        .from('assets')
        .select(`
            *,
            events ( title ),
            profiles ( full_name )
        `)
        .order('type', { ascending: true })

    // Fetch Active Events for the checkout dropdown
    const { data: events } = await supabase
        .from('events')
        .select('id, title')
        .order('created_at', { ascending: false })

    // Fetch the recent activity ledger
    const { data: logs } = await supabase
        .from('asset_logs')
        .select(`
            id,
            action,
            created_at,
            assets ( name, serial_number ),
            events ( title ),
            profiles ( full_name )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-cyan-neon/30 pb-20">
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12">
                
                {/* Header HUD */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-cyan-neon rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,245,255,0.3)]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            </div>
                            <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                                NEXUS <span className="text-cyan-neon">INVENTORY</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <p className="text-sm text-white/40 font-medium tracking-wide">GDP Inventory</p>
                            <span className="hidden md:inline w-1 h-1 bg-white/20 rounded-full"></span>
                            <span className="hidden md:inline text-[10px] font-mono text-cyan-neon/60 uppercase tracking-widest">Systems Online</span>
                        </div>
                    </div>
                    <AddAssetModal />
                </div>

                {/* List HUD */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-cyan-neon rounded-full shadow-[0_0_10px_rgba(0,245,255,0.4)]"></div>
                        <h2 className="text-lg font-display font-bold text-white uppercase tracking-wider">Asset List</h2>
                    </div>
                    <AssetListClient 
                        assets={assets || []} 
                        activeEvents={events || []} 
                        currentUserId={user?.id}
                        userRole={profile?.role}
                    />
                </section>

                {/* Active Borrowers Section */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.4)]"></div>
                        <h2 className="text-lg font-display font-bold text-white uppercase tracking-wider">Active Borrowers</h2>
                    </div>
                    <ActiveBorrowers assets={assets || []} />
                </section>

                {/* Log HUD */}
                {logs && logs.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1.5 h-6 bg-violet-neon rounded-full shadow-[0_0_10px_rgba(138,43,226,0.4)]"></div>
                            <h2 className="text-lg font-display font-bold text-white uppercase tracking-wider">Log</h2>
                        </div>
                        <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
                            <AssetLedger logs={logs} />
                        </div>
                    </section>
                )}
            </main>
        </div>
    )
}
