// app/actions/tasks.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTask(formData: FormData) {
    const supabase = await createClient()

    const eventId = formData.get('eventId') as string
    const title = formData.get('title') as string
    const status = (formData.get('status') as string) || 'Pending'
    const department = formData.get('department') as string || 'Other'
    const description = formData.get('description') as string || null
    const deadline = formData.get('deadline') as string || null
    const assigneeIds = formData.getAll('assigneeIds') as string[] // Can be empty, one, or multiple

    // 1. Insert the Task
    const { data: task, error: taskError } = await supabase.from('tasks').insert([
        { event_id: eventId, title, department, description, deadline, status }
    ]).select().single()

    if (taskError) throw new Error(taskError.message)

    // 2. Insert the Assignees (if any)
    if (assigneeIds.length > 0) {
        const assigneesToInsert = assigneeIds.map(userId => ({
            task_id: task.id,
            user_id: userId
        }))

        const { error: assignError } = await supabase.from('task_assignees').insert(assigneesToInsert)
        if (assignError) throw new Error(assignError.message)
    }

    revalidatePath(`/dashboard/events/${eventId}`)
}

export async function updateTaskStatus(taskId: string, newStatus: string, eventId: string, remarks?: string, assigneeIds?: string[]) {
    const supabase = await createClient()

    const updateData: any = { status: newStatus }
    if (remarks) updateData.rejection_remarks = remarks

    const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)

    if (error) throw new Error(error.message)

    // Handle assignee updates if provided
    if (assigneeIds) {
        // 1. Delete existing assignees
        await supabase.from('task_assignees').delete().eq('task_id', taskId)
        
        // 2. Insert new assignees
        if (assigneeIds.length > 0) {
            const assigneesToInsert = assigneeIds.map(userId => ({
                task_id: taskId,
                user_id: userId
            }))
            const { error: assignError } = await supabase.from('task_assignees').insert(assigneesToInsert)
            if (assignError) throw new Error(assignError.message)
        }
    }

    revalidatePath(`/dashboard/events/${eventId}`)
    revalidatePath(`/dashboard`)
}

export async function addTaskComment(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error("Unauthorized")

    const taskId = formData.get('taskId') as string
    const eventId = formData.get('eventId') as string
    const content = formData.get('content') as string

    if (!content || !content.trim()) return

    const { error } = await supabase.from('task_comments').insert([
        { task_id: taskId, user_id: user.id, content: content.trim() }
    ])

    if (error) throw new Error(error.message)
    revalidatePath(`/dashboard/events/${eventId}`)
}

export async function updateTask(taskId: string, eventId: string, title: string, department: string, description: string, deadline: string, assigneeIds?: string[]) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('tasks')
        .update({ title, department, description, deadline })
        .eq('id', taskId)

    if (error) throw new Error(error.message)

    // Handle assignee updates if provided
    if (assigneeIds) {
        // 1. Delete existing assignees
        await supabase.from('task_assignees').delete().eq('task_id', taskId)
        
        // 2. Insert new assignees
        if (assigneeIds.length > 0) {
            const assigneesToInsert = assigneeIds.map(userId => ({
                task_id: taskId,
                user_id: userId
            }))
            const { error: assignError } = await supabase.from('task_assignees').insert(assigneesToInsert)
            if (assignError) throw new Error(assignError.message)
        }
    }

    revalidatePath(`/dashboard/events/${eventId}`)
}

export async function deleteTask(taskId: string, eventId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

    if (error) throw new Error(error.message)
    revalidatePath(`/dashboard/events/${eventId}`)
}

export async function addSingleTaskJson(taskData: {
    eventId: string
    title: string
    status?: string
    department?: string
    description?: string | null
    deadline?: string | null
    assigneeIds?: string[]
}) {
    const supabase = await createClient()
    const { eventId, title, status = 'Pending', department = 'Other', description = null, deadline = null, assigneeIds = [] } = taskData

    // 1. Insert the Task
    const { data: task, error: taskError } = await supabase.from('tasks').insert([
        { event_id: eventId, title, department, description, deadline, status }
    ]).select().single()

    if (taskError) throw new Error(taskError.message)

    // 2. Insert the Assignees (if any)
    if (assigneeIds && assigneeIds.length > 0) {
        const assigneesToInsert = assigneeIds.map(userId => ({
            task_id: task.id,
            user_id: userId
        }))

        const { error: assignError } = await supabase.from('task_assignees').insert(assigneesToInsert)
        if (assignError) throw new Error(assignError.message)
    }

    revalidatePath(`/dashboard/events/${eventId}`)
    return task
}