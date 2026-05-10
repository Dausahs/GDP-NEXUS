// app/dashboard/loading.tsx
export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-bg text-text-primary">
            {/* Header */}
            <header className="border-b border-border bg-bg-elevated px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="skeleton w-7 h-7 rounded-md" />
                    <div className="skeleton w-24 h-4 rounded" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="skeleton w-16 h-4 rounded hidden md:block" />
                    <div className="skeleton w-7 h-7 rounded-md" />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
                {/* Calendar section */}
                <section>
                    <div className="skeleton w-28 h-3 rounded mb-5" />
                    <div className="card overflow-hidden">
                        <div className="p-5 space-y-4">
                            <div className="skeleton w-full h-10 rounded-lg" />
                            <div className="skeleton w-full h-[540px] rounded-xl" />
                        </div>
                    </div>
                </section>

                {/* Tasks section */}
                <section>
                    <div className="skeleton w-24 h-3 rounded mb-4" />
                    <div className="card overflow-hidden divide-y divide-border">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-3.5 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="skeleton w-2 h-2 rounded-full" />
                                    <div>
                                        <div className="skeleton w-44 h-4 rounded mb-1.5" />
                                        <div className="skeleton w-24 h-3 rounded" />
                                    </div>
                                </div>
                                <div className="skeleton w-16 h-4 rounded" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Projects grid */}
                <section>
                    <div className="skeleton w-24 h-3 rounded mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="card p-5 space-y-3">
                                <div className="skeleton w-2/3 h-5 rounded" />
                                <div className="skeleton w-full h-3 rounded" />
                                <div className="skeleton w-4/5 h-3 rounded" />
                                <div className="pt-4 border-t border-border flex justify-between">
                                    <div className="space-y-1">
                                        <div className="skeleton w-12 h-2.5 rounded" />
                                        <div className="skeleton w-20 h-3.5 rounded" />
                                    </div>
                                    <div className="skeleton w-6 h-6 rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}
