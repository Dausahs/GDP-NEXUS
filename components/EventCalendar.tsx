'use client'

import { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import TaskDetailsModal from './TaskDetailsModal'

const locales = { 'en-US': enUS }
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales })

const deptColors: Record<string, string> = {
    'Graphic':    '#6366f1',
    'Production': '#22c55e',
    'Sculpture':  '#f59e0b',
}

export default function EventCalendar({ tasks, teamMembers, currentUserId }: {
    tasks: any[], teamMembers: any[], currentUserId?: string
}) {
    const [selectedTask, setSelectedTask] = useState<any>(null)
    const [date, setDate] = useState(new Date())
    const [view, setView] = useState<any>('month')
    const [showOnlyMine, setShowOnlyMine] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => { setIsMounted(true) }, [])

    if (!isMounted) return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <div className="skeleton w-36 h-6 rounded" />
                <div className="skeleton w-28 h-8 rounded-lg" />
            </div>
            <div className="skeleton w-full h-12 rounded-lg" />
            <div className="skeleton w-full h-[480px] rounded-xl" />
        </div>
    )

    const calendarEvents = tasks
        .filter(t => t.deadline)
        .filter(t => !showOnlyMine || t.task_assignees?.some((a: any) => a.user_id === currentUserId))
        .map(t => ({
            id: t.id,
            title: t.title,
            start: new Date(t.deadline),
            end: new Date(t.deadline),
            allDay: true,
            resource: { dept: t.department || 'Other', originalTask: t }
        }))

    const eventStyleGetter = (event: any) => {
        const color = deptColors[event.resource.dept] || '#71717a'
        return {
            style: {
                backgroundColor: `${color}18`,
                borderRadius: '5px',
                color: color,
                border: `1px solid ${color}40`,
                fontSize: '11px',
                fontWeight: '500',
                padding: '2px 6px',
            }
        }
    }

    return (
        <div className="p-5">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                <div className="flex flex-wrap gap-3 items-center">
                    {Object.entries(deptColors).map(([name, color]) => (
                        <div key={name} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-xs text-text-secondary">{name}</span>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => setShowOnlyMine(!showOnlyMine)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                        showOnlyMine
                        ? 'bg-accent text-white'
                        : 'bg-bg-subtle text-text-secondary border border-border hover:text-text-primary'
                    }`}
                >
                    {showOnlyMine ? 'My tasks' : 'All tasks'}
                </button>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .rbc-calendar { font-family: var(--font-inter), sans-serif; background: transparent; }
                .rbc-header { padding: 10px 0; font-weight: 500; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; border-bottom: 1px solid rgba(255,255,255,0.07) !important; }
                .rbc-month-view { border-radius: 0.625rem; border: 1px solid rgba(255,255,255,0.07) !important; background: transparent; }
                .rbc-day-bg + .rbc-day-bg { border-left: 1px solid rgba(255,255,255,0.07) !important; }
                .rbc-month-row + .rbc-month-row { border-top: 1px solid rgba(255,255,255,0.07) !important; }
                .rbc-today { background-color: rgba(99,102,241,0.04) !important; }
                .rbc-off-range-bg { background-color: transparent !important; opacity: 0.3; }
                .rbc-toolbar { margin-bottom: 1.25rem !important; }
                .rbc-toolbar button { background: transparent !important; border: 1px solid rgba(255,255,255,0.07) !important; color: #a1a1aa !important; font-size: 11px; font-weight: 500; border-radius: 6px; padding: 5px 12px; transition: all 0.15s; }
                .rbc-toolbar button:hover { background: rgba(255,255,255,0.05) !important; color: #f4f4f5 !important; }
                .rbc-toolbar button.rbc-active { background: rgba(99,102,241,0.15) !important; color: #818cf8 !important; border-color: rgba(99,102,241,0.3) !important; }
                .rbc-event { padding: 0 !important; background: none !important; }
                .rbc-show-more { color: #6366f1 !important; font-size: 10px; font-weight: 500; }
                .rbc-date-cell { font-size: 11px; color: #71717a; padding: 6px 8px; }
                .rbc-date-cell.rbc-now { color: #818cf8; font-weight: 600; }
                .rbc-time-view { border: 1px solid rgba(255,255,255,0.07) !important; border-radius: 0.625rem !important; overflow: hidden; background: transparent; }
                .rbc-time-header { margin-right: 0 !important; border-bottom: 1px solid rgba(255,255,255,0.07) !important; }
                .rbc-time-header-content { border-left: 1px solid rgba(255,255,255,0.07) !important; }
                .rbc-time-gutter, .rbc-time-header-gutter, .rbc-time-content { display: none !important; }
                .rbc-allday-cell { min-height: 380px !important; display: flex !important; flex-direction: column; }
                .rbc-day-slot { border-left: 1px solid rgba(255,255,255,0.07) !important; }
                .rbc-allday-cell .rbc-row-bg { display: flex; position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 0; }
                .rbc-allday-cell .rbc-day-bg { border-left: 1px solid rgba(255,255,255,0.07) !important; flex: 1; }
                .rbc-allday-cell .rbc-day-bg:first-child { border-left: none !important; }
                .rbc-row-segment { padding: 1px 3px !important; }
                .rbc-toolbar-label { color: #f4f4f5; font-weight: 500; font-size: 14px; }
            `}} />

            <div className="h-[560px]">
                <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    date={date}
                    view={view}
                    onNavigate={newDate => setDate(newDate)}
                    onView={newView => setView(newView)}
                    style={{ height: '100%' }}
                    eventPropGetter={eventStyleGetter}
                    views={['month', 'week', 'day']}
                    onSelectEvent={(event: any) => setSelectedTask(event.resource.originalTask)}
                />
            </div>

            {selectedTask && (
                <TaskDetailsModal
                    task={selectedTask}
                    eventId={selectedTask.event_id}
                    onClose={() => setSelectedTask(null)}
                    teamMembers={teamMembers}
                />
            )}
        </div>
    )
}
