'use client'

import { useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
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

export default function EventCalendar({ tasks, teamMembers, currentUserId }: { tasks: any[], teamMembers: any[], currentUserId?: string }) {
    const [selectedTask, setSelectedTask] = useState<any>(null)
    const [date, setDate] = useState(new Date())
    const [view, setView] = useState<any>('month')
    const [showOnlyMine, setShowOnlyMine] = useState(false)

    // Prepare events
    const calendarEvents = tasks
        .filter(t => t.deadline)
        .filter(t => !showOnlyMine || t.task_assignees?.some((a: any) => a.user_id === currentUserId))
        .map(t => {
            return {
                id: t.id,
                title: t.title,
                start: new Date(t.deadline),
                end: new Date(t.deadline),
                allDay: true, 
                resource: { dept: t.department || 'Other', originalTask: t }
            }
        })

    const eventStyleGetter = (event: any) => {
        let color = '#52525b' // default zinc
        const deptLower = event.resource.dept?.toLowerCase() || ''

        if (deptLower.includes('graphic')) color = '#00F5FF' // cyan
        else if (deptLower.includes('production')) color = '#10B981' // emerald
        else if (deptLower.includes('sculpture')) color = '#8A2BE2' // violet

        return {
            style: {
                backgroundColor: `${color}22`,
                borderRadius: '8px',
                color: color,
                border: `1px solid ${color}44`,
                display: 'block',
                fontSize: '10px',
                fontWeight: '700',
                padding: '4px 8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                boxShadow: `0 0 10px ${color}11`
            }
        }
    }

    return (
        <div className="bg-transparent p-6 rounded-[2rem] relative z-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h2 className="text-xl font-display font-bold text-white flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-neon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    PROJECT CALENDAR
                </h2>

                <button 
                    onClick={() => setShowOnlyMine(!showOnlyMine)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-mono font-bold uppercase tracking-widest transition-all ${
                        showOnlyMine 
                        ? 'bg-cyan-neon text-black shadow-[0_0_20px_rgba(0,245,255,0.4)]' 
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    {showOnlyMine ? 'MY TASKS' : 'ALL PROJECT TASKS'}
                </button>
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-6 mb-10 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#00F5FF] shadow-[0_0_8px_rgba(0,245,255,0.4)]"></div><span className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest">Graphic</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div><span className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest">Production</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#8A2BE2] shadow-[0_0_8px_rgba(138,43,226,0.4)]"></div><span className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest">Sculpture</span></div>
            </div>

            <div className="h-[600px] calendar-wrapper relative z-0">
                <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    date={date}
                    view={view}
                    onNavigate={(newDate) => setDate(newDate)}
                    onView={(newView) => setView(newView)}
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
            
            <style jsx global>{`
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
                .rbc-show-more { color: #00F5FF !important; font-size: 10px; font-weight: 700; }
                
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
            `}</style>
        </div>
    )
}
