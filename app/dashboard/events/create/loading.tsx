// app/dashboard/events/create/loading.tsx
export default function CreateEventLoading() {
    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
            <div className="w-full max-w-2xl glass rounded-[3rem] border border-white/5 p-10 space-y-8">
                {/* Title */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="skeleton w-12 h-12 rounded-2xl" />
                    <div className="flex flex-col gap-2">
                        <div className="skeleton w-40 h-6 rounded" />
                        <div className="skeleton w-56 h-3 rounded" />
                    </div>
                </div>
                {/* Form fields */}
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="skeleton w-28 h-3 rounded" />
                        <div className="skeleton w-full h-14 rounded-2xl" />
                    </div>
                ))}
                <div className="skeleton w-full h-14 rounded-2xl mt-4" />
            </div>
        </div>
    )
}
