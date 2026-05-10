// components/AddAssetModal.tsx
'use client'

import { useState } from 'react'
import { addAsset } from '@/app/actions/assets'

const ASSET_TYPES = ['Camera Body', 'Lens', 'Audio', 'Lighting', 'Grip / Rigging', 'Other']

export default function AddAssetModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        try {
            await addAsset(formData)
            setIsOpen(false)
            ;(document.getElementById('add-asset-form') as HTMLFormElement)?.reset()
        } catch (e) {
            alert('Failed to add equipment.')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-xs font-medium transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add equipment
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-bg-elevated border border-border rounded-xl max-w-md w-full p-6 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-semibold text-text-primary">Add equipment</h2>
                            <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>

                        <form id="add-asset-form" action={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1.5">Equipment name</label>
                                <input
                                    name="name"
                                    required
                                    autoFocus
                                    placeholder="e.g. Sony A7 IV"
                                    className="w-full bg-bg-subtle border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors placeholder:text-text-muted"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Category</label>
                                    <select
                                        name="type"
                                        className="w-full bg-bg-subtle border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors appearance-none"
                                    >
                                        {ASSET_TYPES.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Serial number</label>
                                    <input
                                        name="serial_number"
                                        placeholder="Optional"
                                        className="w-full bg-bg-subtle border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors placeholder:text-text-muted"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1.5">Condition</label>
                                <select
                                    name="condition"
                                    className="w-full bg-bg-subtle border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors appearance-none"
                                >
                                    <option value="Good">Good</option>
                                    <option value="Fair">Fair</option>
                                    <option value="Needs Repair">Needs Repair</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsOpen(false)}
                                    className="flex-1 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isPending}
                                    className="flex-[2] bg-accent hover:bg-accent-hover text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                                    {isPending ? 'Adding…' : 'Add equipment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
