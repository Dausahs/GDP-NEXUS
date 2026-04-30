'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addAsset(formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const serial_number = formData.get('serial_number') as string

    const { error } = await supabase.from('assets').insert([
        { name, type, serial_number, status: 'Available' }
    ])

    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/assets')
}

export async function checkoutAsset(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Retrieve multiple asset IDs
    const assetIds = formData.getAll('assetIds') as string[]
    const eventId = formData.get('eventId') as string
    const userId = formData.get('userId') as string || user.id

    if (!eventId) throw new Error("A valid Event ID is required to checkout gear.")
    if (!assetIds || assetIds.length === 0) throw new Error("No assets selected.")

    // 1. Update Asset Status for multiple items
    const { error: assetError } = await supabase
        .from('assets')
        .update({ 
            status: 'In Use', 
            current_event_id: eventId, 
            current_user_id: userId 
        })
        .in('id', assetIds)
        .eq('status', 'Available') // Basic concurrency check

    if (assetError) throw new Error(assetError.message)

    // 2. Write to Ledger for all items
    const logs = assetIds.map(id => ({
        asset_id: id,
        event_id: eventId,
        user_id: userId,
        action: 'Checkout'
    }))

    const { error: logError } = await supabase.from('asset_logs').insert(logs)

    if (logError) throw new Error(logError.message)
    revalidatePath('/dashboard/assets')
}

export async function returnAsset(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const assetId = formData.get('assetId') as string
    
    // Get current asset state for logging
    const { data: asset } = await supabase.from('assets').select('*').eq('id', assetId).single()
    if (!asset || asset.status !== 'In Use') throw new Error("Asset is not checked out.")

    // Check if user is the borrower or an admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (asset.current_user_id !== user.id && profile?.role !== 'admin') {
        throw new Error("You are not authorized to return this item. Only the borrower or an admin can return it.")
    }

    // 1. Update Asset Status back to Available
    const { error: assetError } = await supabase
        .from('assets')
        .update({ 
            status: 'Available', 
            current_event_id: null, 
            current_user_id: null 
        })
        .eq('id', assetId)

    if (assetError) throw new Error(assetError.message)

    // 2. Write to Ledger
    const { error: logError } = await supabase.from('asset_logs').insert([
        { asset_id: assetId, event_id: asset.current_event_id, user_id: user.id, action: 'Return' }
    ])

    if (logError) throw new Error(logError.message)
    revalidatePath('/dashboard/assets')
}