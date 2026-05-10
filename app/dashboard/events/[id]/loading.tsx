// app/dashboard/events/[id]/loading.tsx
// Shown while the event detail page is fetching data from Supabase

export default function EventDetailLoading() {
    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8 space-y-8 md:space-y-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8">
                <div className="space-y-4 max-w-2xl w-full">
                    <div className="flex items-center gap-4">
                        <div className="skeleton w-72 h-10 rounded" />
                    </div>
                    <div className="skeleton w-full h-px rounded" />
                    <div className="skeleton w-96 h-5 rounded" />
                </div>
                <div className="skeleton w-48 h-12 rounded-2xl" />
            </div>

            {/* Kanban Section */}
            <section>
                <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="skeleton w-1.5 h-6 rounded-full" />
                    <div className="skeleton w-32 h-5 rounded" />
                </div>
                <div className="glass rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-8 border border-white/5">
                    <div className="flex gap-6 overflow-hidden">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex-1 min-w-[280px] flex flex-col gap-4">
                                <div className="skeleton w-24 h-5 rounded" />
                                {[...Array(3)].map((_, j) => (
                                    <div key={j} className="skeleton rounded-2xl h-24 w-full" />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Calendar Section */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="skeleton w-1.5 h-6 rounded-full" />
                    <div className="skeleton w-36 h-5 rounded" />
                </div>
                <div className="skeleton rounded-[2.5rem] h-[620px] w-full" />
            </section>

            {/* Upcoming Tasks */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="skeleton w-1.5 h-6 rounded-full" />
                        <div className="skeleton w-36 h-5 rounded" />
                    </div>
                    <div className="skeleton w-28 h-9 rounded-2xl" />
                </div>
                <div className="glass rounded-[2rem] border border-white/5 overflow-hidden divide-y divide-white/5">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-6 md:p-8 flex items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="skeleton w-2 h-10 rounded-full" />
                                <div className="flex flex-col gap-2">
                                    <div className="skeleton w-24 h-3 rounded" />
                                    <div className="skeleton w-40 h-5 rounded" />
                                </div>
                            </div>
                            <div className="skeleton w-24 h-4 rounded" />
                        </div>
                    ))}
                </div>
            </section>

            {/* Working Schedule */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="skeleton w-1.5 h-6 rounded-full" />
                    <div className="skeleton w-40 h-5 rounded" />
                </div>
                <div className="skeleton rounded-[2.5rem] h-48 w-full" />
            </section>
        </div>
    )
}
