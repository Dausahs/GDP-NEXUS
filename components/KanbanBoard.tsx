// components/KanbanBoard.tsx
'use client'

import React, { useState } from 'react'
import { DndContext, DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core'
import { KanbanColumn } from './KanbanColumn'
import { updateTaskStatus } from '@/app/actions/tasks'

const COLUMNS = [
  { id: 'Pending', title: 'Backlog' },
  { id: 'Ongoing', title: 'Ongoing' },
  { id: 'QC', title: 'Quality Check' },
  { id: 'Delivered', title: 'Delivered' }
]

export default function KanbanBoard({ initialTasks, eventId, userRole }: { initialTasks: any[], eventId: string, userRole?: string }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [isMounted, setIsMounted] = useState(false)

  React.useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Configure sensors for smooth mobile "hold and drag" and desktop interaction
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { 
      activationConstraint: { 
        delay: 250, // Long press to start drag (allows scrolling)
        tolerance: 10 
      } 
    })
  )

  if (!isMounted) {
    return (
      <div className="h-[200px] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-cyan-neon border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,245,255,0.2)]"></div>
        <p className="text-[10px] font-mono text-cyan-neon uppercase tracking-[0.3em] animate-pulse">Establishing Operational Uplink...</p>
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

    // 1. Optimistic UI Update (Update local state immediately)
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ))

    // 2. Persist to Supabase
    try {
      await updateTaskStatus(taskId, newStatus, eventId)
    } catch (error) {
      console.error("Failed to update task:", error)
      // Rollback on error
      setTasks(initialTasks)
    }
  }

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <KanbanColumn 
            key={col.id} 
            id={col.id} 
            title={col.title} 
            tasks={tasks.filter(t => t.status === col.id)} 
            eventId={eventId}
            userRole={userRole}
          />
        ))}
      </div>
    </DndContext>
  )
}