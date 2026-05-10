'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Thin neon progress bar that appears at the top of the page during
 * client-side navigation — inspired by NProgress / Turbolinks.
 */
function ProgressBarInner() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [progress, setProgress] = useState(0)
    const [visible, setVisible] = useState(false)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const prevPathRef = useRef<string>('')

    const currentUrl = pathname + searchParams.toString()

    // When the URL changes, the page has finished loading — complete the bar
    useEffect(() => {
        if (prevPathRef.current && prevPathRef.current !== currentUrl) {
            // Complete
            setProgress(100)
            if (timerRef.current) clearInterval(timerRef.current)
            completeTimerRef.current = setTimeout(() => {
                setVisible(false)
                setProgress(0)
            }, 400)
        }
        prevPathRef.current = currentUrl
    }, [currentUrl])

    // Listen for link clicks to start the bar
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement).closest('a')
            if (!anchor) return
            const href = anchor.getAttribute('href')
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return
            if (anchor.target === '_blank') return

            // Start the progress bar
            if (timerRef.current) clearInterval(timerRef.current)
            if (completeTimerRef.current) clearTimeout(completeTimerRef.current)
            setProgress(5)
            setVisible(true)

            // Gradually increment — slows as it approaches 90%
            let current = 5
            timerRef.current = setInterval(() => {
                const remaining = 90 - current
                const increment = Math.max(remaining * 0.1, 0.5)
                current = Math.min(current + increment, 90)
                setProgress(current)
            }, 200)
        }

        document.addEventListener('click', handleClick, true)
        return () => {
            document.removeEventListener('click', handleClick, true)
            if (timerRef.current) clearInterval(timerRef.current)
            if (completeTimerRef.current) clearTimeout(completeTimerRef.current)
        }
    }, [])

    if (!visible) return null

    return (
        <div
            className="fixed top-0 left-0 z-[9999] h-[2px] transition-all duration-300 ease-out pointer-events-none"
            style={{
                width: `${progress}%`,
                background: '#6366f1',
                opacity: visible ? 1 : 0,
            }}
        />
    )
}

export default function NavigationProgress() {
    return (
        <Suspense fallback={null}>
            <ProgressBarInner />
        </Suspense>
    )
}
