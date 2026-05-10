'use client'

import React, { useState } from 'react'
import { DndContext, DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core'
import { KanbanColumn } from './KanbanColumn'
import { updateTaskStatus } from '@/app/actions/tasks'

const COLUMNS = [
  { id: 'Requested', title: 'Requested' },
  { id: 'Pending',   title: 'Backlog' },
  { id: 'Ongoing',   title: 'In progress' },
  { id: 'QC',        title: 'Review' },
  { id: 'Delivered', title: 'Done' },
  { id: 'Rejected',  title: 'Rejected' },
]

export default function KanbanBoard({ initialTasks, eventId, userRole, teamMembers }: {
  initialTasks: any[], eventId: string, userRole?: string, teamMembers: any[]
}) {
  const [tasks, setTasks] = useState(initialTasks)
  const [isMounted, setIsMounted] = useState(false)

  React.useEffect(() => { setTasks(initialTasks) }, [initialTasks])
  React.useEffect(() => { setIsMounted(true) }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 10 } })
  )

  const isManagement = userRole === 'MT' || userRole === 'organizer'
  const visibleColumns = COLUMNS.filter(col => {
    if (col.id === 'Requested' || col.id === 'Rejected') return isManagement
    return true
  })

  if (!isMounted) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 min-w-[220px] space-y-3">
            <div className="skeleton h-5 w-20 rounded" />
            {[...Array(2)].map((_, j) => (
              <div key={j} className="skeleton h-20 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const taskId = active.id as string
    const newStatus = over.id as string
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    try {
      await updateTaskStatus(taskId, newStatus, eventId)
    } catch {
      setTasks(initialTasks)
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto pb-4 -mx-2 px-2 custom-scrollbar">
        <div className={`flex gap-4 ${isManagement ? 'min-w-[1400px]' : 'min-w-[900px]'} lg:min-w-full`}>
          {visibleColumns.map((col) => (
            <div key={col.id} className="flex-1 min-w-[240px]">
              <KanbanColumn
                id={col.id}
                title={col.title}
                tasks={tasks.filter(t => t.status === col.id)}
                eventId={eventId}
                userRole={userRole}
                teamMembers={teamMembers}
              />
            </div>
          ))}
        </div>
      </div>
    </DndContext>
  )
}