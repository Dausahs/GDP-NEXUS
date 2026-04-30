import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// The cron job runs in the background and requires the Service Role Key to bypass RLS policies
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key')

export async function GET(request: Request) {
    // Basic security check: Secure this endpoint in production using a secret token
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // For development, we allow it to run without auth but log a warning
        console.warn("Cron endpoint called without valid CRON_SECRET. Bypassing for dev purposes.")
    }

    const now = new Date()
    // Calculate UTC midnight for today
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    
    const sevenDaysFromNow = new Date(today)
    sevenDaysFromNow.setUTCDate(today.getUTCDate() + 7)
    
    const eightDaysFromNow = new Date(today)
    eightDaysFromNow.setUTCDate(today.getUTCDate() + 8)

    const logs: string[] = []

    try {
        // ==========================================
        // 1. SCENARIO A: 1-Week Task Reminders
        // ==========================================
        
        // Find tasks due exactly 7 days from now, that are NOT marked as 'Delivered'
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select(`
                id, title, deadline,
                task_assignees (
                    profiles ( id, full_name, email )
                )
            `)
            .neq('status', 'Delivered')
            .gte('deadline', sevenDaysFromNow.toISOString())
            .lt('deadline', eightDaysFromNow.toISOString())

        if (tasksError) throw tasksError

        for (const task of tasks || []) {
            const assignees = task.task_assignees?.map((ta: any) => ta.profiles).filter(Boolean) || []
            
            for (const profile of assignees) {
                if (!profile.email) {
                    logs.push(`Skipped task reminder for ${profile.full_name}: No email on file.`)
                    continue
                }
                
                // Send Email via Resend
                if (process.env.RESEND_API_KEY) {
                    await resend.emails.send({
                        from: 'Autopilot <onboarding@resend.dev>', // Update with your verified domain in production
                        to: profile.email,
                        subject: `Task Update: ${task.title}`,
                        html: `<p>Hi ${profile.full_name},</p>
                               <p>This <strong>${task.title}</strong> deadline is in 1 week. How the progress?</p>
                               <p>- The Autopilot</p>`
                    })
                }
                logs.push(`Sent 1-week reminder to ${profile.email} for task: ${task.title}`)
            }
        }

        // ==========================================
        // 2. SCENARIO B: Overdue Gear Alerts
        // ==========================================
        
        // Find gear currently 'In Use' where the assigned event has already ended
        const { data: assets, error: assetsError } = await supabase
            .from('assets')
            .select(`
                id, name,
                events!inner ( id, title, end_date ),
                profiles ( id, full_name, email )
            `)
            .eq('status', 'In Use')
            .lt('events.end_date', today.toISOString()) // Event ended before today

        if (assetsError) throw assetsError

        for (const asset of assets || []) {
            const profile = asset.profiles as any
            if (!profile || !profile.email) {
                logs.push(`Skipped overdue alert for ${asset.name}: No email on file for assignee.`)
                continue
            }
            
            // Send Email via Resend
            if (process.env.RESEND_API_KEY) {
                await resend.emails.send({
                    from: 'Inventory Manager <onboarding@resend.dev>',
                    to: profile.email,
                    subject: `⚠️ Overdue Gear Alert: Please return ${asset.name}`,
                    html: `<p>Hi ${profile.full_name},</p>
                           <p>Our records show you checked out the <strong>${asset.name}</strong> for the event "${asset.events.title}".</p>
                           <p>That event concluded on ${new Date(asset.events.end_date).toLocaleDateString()}. Please return the gear to the Inventory immediately.</p>
                           <p>- The Autopilot</p>`
                })
            }
            logs.push(`Sent overdue gear alert to ${profile.email} for asset: ${asset.name}`)
        }

        return NextResponse.json({ 
            status: "success", 
            message: `Processed nudges successfully.`,
            logs 
        })

    } catch (error: any) {
        console.error("Cron Error:", error)
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 })
    }
}
