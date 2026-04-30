// components/EventForm.tsx
'use client'

import { useActionState } from 'react'
import { createEvent, type EventFormState } from '@/app/actions/events'

const initialState: EventFormState = {}

export default function EventForm({ users, mtId }: { users: any[], mtId?: string }) {
    const [state, formAction, isPending] = useActionState(createEvent, initialState)

    const departments = [
        { label: 'GDP Person in Charge', name: 'picId' },
        { label: 'Graphics Lead', name: 'graphicLeadId' },
        { label: 'Production Lead', name: 'productionLeadId' },
        { label: 'Videography Lead', name: 'videoLeadId' },
        { label: 'Photography Lead', name: 'photoLeadId' },
    ]

    return (
        <form action={formAction} className="glass rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
            {/* Error HUD */}
            {state?.error && (
                <div className="mb-8 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    {state.error}
                </div>
            )}

            <div className="space-y-10">
                {/* Section: Event Details */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-cyan-neon rounded-full"></div>
                        <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">Event Details</h3>
                    </div>
                    
                    <div className="grid gap-8">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Event Name</label>
                            <input 
                                name="title" 
                                required 
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-cyan-neon transition-all placeholder:text-white/10 font-medium" 
                                placeholder="e.g. Convocation Expo 2026" 
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Creative Brief</label>
                            <textarea 
                                name="description" 
                                className="w-full bg-white/5 border border-white/5 rounded-[2rem] px-6 py-4 text-white outline-none focus:border-cyan-neon transition-all resize-none font-medium" 
                                rows={3} 
                                placeholder="Core objectives and creative direction..."
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Event Date</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest ml-1">Event Start</span>
                                    <input 
                                        type="datetime-local" 
                                        name="startDate" 
                                        required 
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-cyan-neon transition-all font-medium cursor-pointer" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest ml-1">Event End</span>
                                    <input 
                                        type="datetime-local" 
                                        name="endDate" 
                                        required 
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-cyan-neon transition-all font-medium cursor-pointer" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-white/5"></div>

                {/* Section: Agency Leadership */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-6 bg-violet-neon rounded-full"></div>
                            <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">Agency Leadership</h3>
                        </div>
                        <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest ml-5">Assign key personnel to lead the campaign</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Organizer Select */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Project Organizer</label>
                            <select 
                                name="organizerId" 
                                required 
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-cyan-neon transition-all appearance-none cursor-pointer font-medium"
                            >
                                <option value="" className="bg-[#161B22]">Select Organizer...</option>
                                {users.filter(u => u.role === 'organizer').map(u => (
                                    <option key={u.id} value={u.id} className="bg-[#161B22]">{u.full_name}</option>
                                ))}
                            </select>
                        </div>

                        {departments.map((dept) => (
                            <div key={dept.name} className="space-y-2">
                                <label className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">{dept.label}</label>
                                <select 
                                    name={dept.name} 
                                    required 
                                    defaultValue={dept.name === 'picId' ? mtId : ''}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-cyan-neon transition-all appearance-none cursor-pointer font-medium"
                                >
                                    <option value="" className="bg-[#161B22]">Select Lead...</option>
                                    {users.filter(u => u.role === 'MT' || u.role === 'Penyelaras').map(u => (
                                        <option key={u.id} value={u.id} className="bg-[#161B22]">{u.full_name}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-cyan-neon text-black py-5 rounded-2xl font-display font-bold text-sm shadow-[0_0_40px_rgba(0,245,255,0.2)] hover:scale-[1.01] active:scale-95 transition-all uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? 'PREPARING LAUNCH...' : 'LAUNCH CAMPAIGN'}
                </button>
            </div>
        </form>
    )
}