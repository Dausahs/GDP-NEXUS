// app/dashboard/assets/loading.tsx
// Shown while the assets page fetches inventory data

export default function AssetsLoading() {
    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="skeleton w-8 h-8 rounded-lg" />
                            <div className="skeleton w-56 h-9 rounded" />
                        </div>
                        <div className="skeleton w-40 h-4 rounded mt-2" />
                    </div>
                    <div className="skeleton w-40 h-12 rounded-2xl" />
                </div>

                {/* Asset List */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="skeleton w-1.5 h-6 rounded-full" />
                        <div className="skeleton w-24 h-5 rounded" />
                    </div>
                    <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
                        {/* Table header */}
                        <div className="flex gap-6 border-b border-white/5 p-6 bg-white/[0.02]">
                            {[16, 48, 32, 20, 20].map((w, i) => (
                                <div key={i} className={`skeleton h-3 rounded`} style={{ width: `${w}%` }} />
                            ))}
                        </div>
                        {/* Rows */}
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="flex items-center gap-6 p-6 border-b border-white/5">
                                <div className="skeleton w-6 h-6 rounded-lg flex-shrink-0" />
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <div className="skeleton w-36 h-4 rounded" />
                                    <div className="skeleton w-20 h-3 rounded" />
                                </div>
                                <div className="skeleton w-28 h-3 rounded hidden md:block" />
                                <div className="skeleton w-20 h-6 rounded-full" />
                                <div className="skeleton w-16 h-7 rounded-lg ml-auto" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Active Borrowers */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="skeleton w-1.5 h-6 rounded-full" />
                        <div className="skeleton w-36 h-5 rounded" />
                    </div>
                    <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
                        <div className="flex gap-6 border-b border-white/5 p-6 bg-white/[0.02]">
                            {[30, 30, 40].map((w, i) => (
                                <div key={i} className="skeleton h-3 rounded" style={{ width: `${w}%` }} />
                            ))}
                        </div>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-6 p-6 border-b border-white/5">
                                <div className="flex items-center gap-3 w-[30%]">
                                    <div className="skeleton w-8 h-8 rounded-full" />
                                    <div className="skeleton w-28 h-4 rounded" />
                                </div>
                                <div className="skeleton w-[30%] h-4 rounded" />
                                <div className="flex flex-col gap-2 w-[40%]">
                                    <div className="skeleton w-32 h-4 rounded" />
                                    <div className="skeleton w-24 h-3 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Activity Log */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="skeleton w-1.5 h-6 rounded-full" />
                        <div className="skeleton w-16 h-5 rounded" />
                    </div>
                    <div className="glass rounded-[2rem] border border-white/5 overflow-hidden divide-y divide-white/5">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="p-6 flex items-center gap-6">
                                <div className="skeleton w-16 h-5 rounded-full" />
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <div className="skeleton w-48 h-4 rounded" />
                                    <div className="skeleton w-32 h-3 rounded" />
                                </div>
                                <div className="skeleton w-24 h-3 rounded" />
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}
