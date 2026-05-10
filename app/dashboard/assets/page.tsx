// app/dashboard/assets/page.tsx
import { createClient } from '@/utils/supabase/server'
import AddAssetModal from '@/components/AddAssetModal'
import AssetListClient from '@/components/AssetListClient'
import AssetLedger from '@/components/AssetLedger'
import ActiveBorrowers from '@/components/ActiveBorrowers'

export const dynamic = 'force-dynamic'

export default async function AssetsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    const { data: assets } = await supabase
        .from('assets')
        .select('*, events ( title ), profiles ( full_name )')
        .order('type', { ascending: true })

    const { data: events } = await supabase
        .from('events')
        .select('id, title')
        .order('created_at', { ascending: false })

    const { data: logs } = await supabase
        .from('asset_logs')
        .select('id, action, created_at, assets ( name, serial_number ), events ( title ), profiles ( full_name )')
        .order('created_at', { ascending: false })
        .limit(50)

    return (
        <div className="min-h-screen bg-bg text-text-primary pb-24">
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-display font-semibold text-text-primary tracking-tight">Inventory</h1>
                        <p className="text-sm text-text-secondary mt-1">GDP equipment tracking</p>
                    </div>
                    <AddAssetModal />
                </div>

                {/* Asset List */}
                <section>
                    <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Equipment</h2>
                    <AssetListClient
                        assets={assets || []}
                        activeEvents={events || []}
                        currentUserId={user?.id}
                        userRole={profile?.role}
                    />
                </section>

                {/* Active Borrowers */}
                <section>
                    <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Currently Checked Out</h2>
                    <ActiveBorrowers assets={assets || []} />
                </section>

                {/* Log */}
                {logs && logs.length > 0 && (
                    <section>
                        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Activity Log</h2>
                        <div className="card overflow-hidden">
                            <AssetLedger logs={logs} />
                        </div>
                    </section>
                )}
            </main>
        </div>
    )
}
