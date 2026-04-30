// components/AssetReturnButton.tsx
'use client'

import { returnAsset } from '@/app/actions/assets'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
            {pending ? 'Processing...' : 'Mark as Returned'}
        </button>
    )
}

export default function AssetReturnButton({ assetId }: { assetId: string }) {
    return (
        <form action={returnAsset}>
            <input type="hidden" name="assetId" value={assetId} />
            <SubmitButton />
        </form>
    )
}