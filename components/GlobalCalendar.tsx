'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import TaskDetailsModal from './TaskDetailsModal'

const locales = {
    'en-US': enUS,
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})

const departmentColors: Record<string, string> = {
    'Graphic': '#00F5FF', // Cyan Neon
    'Production': '#10B981', // Emerald
    'Sculpture': '#8A2BE2', // Violet
}

export default function GlobalCalendar({ tasks, currentUserId }: { tasks: any[], currentUserId?: string }) {
    const [isMounted, setIsMounted] = useState(false)
    const [date, setDate] = useState(new Date())
    const [view, setView] = useState<any>(Views.MONTH)
    const [showOnlyMine, setShowOnlyMine] = useState(false)
    const [selectedTask, setSelectedTask] = useState<any>(null)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return <div className="h-[500px] w-full bg-surface animate-pulse rounded-[2rem]" />

    const filteredTasks = showOnlyMine 
        ? tasks.filter(t => t.task_assignees?.some((a: any) => a.user_id === currentUserId))
        : tasks

    const events = filteredTasks
        .filter(t => t.deadline)
        .map(t => ({
            id: t.id,
            title: `${t.title} [${t.events?.title || 'Unknown Event'}]`,
            start: new Date(t.deadline),
            end: new Date(t.deadline),
            allDay: true,
            resource: t
        }))

    const eventStyleGetter = (event: any) => {
        const dept = event.resource.department
        const backgroundColor = departmentColors[dept] || '#52525b'
        return {
            style: {
                backgroundColor: `${backgroundColor}22`,
                borderRadius: '8px',
                color: backgroundColor,
                border: `1px solid ${backgroundColor}44`,
                display: 'block',
                fontSize: '10px',
                fontWeight: '700',
                padding: '4px 8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                boxShadow: `0 0 10px ${backgroundColor}11`
            }
        }
    }

    return (
        <div className="bg-transparent p-6 rounded-[2rem] mb-10 overflow-hidden">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => setShowOnlyMine(!showOnlyMine)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-mono font-bold uppercase tracking-widest transition-all ${
                            showOnlyMine 
                            ? 'bg-cyan-neon text-black shadow-[0_0_20px_rgba(0,245,255,0.4)]' 
                            : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/5'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        {showOnlyMine ? 'MY TASKS' : 'ALL TEAM TASKS'}
                    </button>
                    {!showOnlyMine && (
                        <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">Task Logs: {tasks.length} Total</span>
                    )}
                </div>
            </div>

            {/* Color Legend */}
            <div className="flex flex-wrap gap-6 mb-10 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
                {Object.entries(departmentColors).map(([name, color]) => (
                    <div key={name} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" style={{ backgroundColor: color }}></div>
                        <span className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">{name}</span>
                    </div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .rbc-calendar { font-family: 'JetBrains Mono', monospace; }
                .rbc-header { padding: 16px 0; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(255,255,255,0.3); border-bottom: 1px solid rgba(255,255,255,0.05) !important; }
                .rbc-month-view { border-radius: 2rem; border: 1px solid rgba(255,255,255,0.05) !important; background: rgba(255,255,255,0.01); }
                .rbc-day-bg + .rbc-day-bg { border-left: 1px solid rgba(255,255,255,0.05) !important; }
                .rbc-month-row + .rbc-month-row { border-top: 1px solid rgba(255,255,255,0.05) !important; }
                .rbc-today { background-color: rgba(0, 245, 255, 0.03) !important; }
                .rbc-off-range-bg { background-color: transparent !important; opacity: 0.2; }
                .rbc-toolbar { margin-bottom: 2rem !important; }
                .rbc-toolbar button { background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.05) !important; color: rgba(255,255,255,0.5) !important; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 12px; padding: 8px 16px; transition: all 0.2s; }
                .rbc-toolbar button:hover { background: rgba(255,255,255,0.1) !important; color: white !important; }
                .rbc-toolbar button.rbc-active { background: white !important; color: black !important; box-shadow: 0 0 20px rgba(255,255,255,0.3); }
                .rbc-event { padding: 0 !important; background: none !important; }
                .rbc-show-more { color: var(--accent-cyan) !important; font-size: 10px; font-weight: 700; }
                
                /* PROPER WEEK VIEW FIXES */
                .rbc-time-view { border: 1px solid rgba(255,255,255,0.05) !important; border-radius: 2rem !important; overflow: hidden; background: rgba(255,255,255,0.01); margin-top: 1rem; }
                .rbc-time-header { margin-right: 0 !important; border-bottom: 1px solid rgba(255,255,255,0.05) !important; }
                .rbc-time-header-content { border-left: 1px solid rgba(255,255,255,0.05) !important; }
                .rbc-time-gutter, .rbc-time-header-gutter, .rbc-time-content { display: none !important; }
                .rbc-allday-cell { min-height: 400px !important; display: flex !important; flex-direction: column; }
                .rbc-day-slot { border-left: 1px solid rgba(255,255,255,0.05) !important; }
                .rbc-allday-cell .rbc-row-bg { display: flex; position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 0; }
                .rbc-allday-cell .rbc-day-bg { border-left: 1px solid rgba(255,255,255,0.05) !important; flex: 1; }
                .rbc-allday-cell .rbc-day-bg:first-child { border-left: none !important; }
                
                /* Event Card Enhancements */
                .rbc-event-content { font-family: 'JetBrains Mono', monospace; font-size: 9px; line-height: 1.2; }
                .rbc-row-segment { padding: 2px 4px !important; }
            `}} />
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                date={date}
                view={view}
                onNavigate={(newDate) => setDate(newDate)}
                onView={(newView) => setView(newView)}
                style={{ height: 600 }}
                eventPropGetter={eventStyleGetter}
                views={[Views.MONTH, Views.WEEK, Views.DAY]}
                onSelectEvent={(event: any) => setSelectedTask(event.resource)}
            />

            {selectedTask && (
                <TaskDetailsModal 
                    task={selectedTask} 
                    eventId={selectedTask.event_id} 
                    onClose={() => setSelectedTask(null)} 
                />
            )}
        </div>
    )
}

