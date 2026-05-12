'use client'

import { useEffect, useState } from 'react'
import { signIn } from '@/app/actions/auth'

export default function LoginForm({ error }: { error?: string }) {
    const [mounted, setMounted] = useState(false)
    const [isPending, setIsPending] = useState(false)

    useEffect(() => {
        // Small delay so the animation is noticeable on load
        const t = setTimeout(() => setMounted(true), 60)
        return () => clearTimeout(t)
    }, [])

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsPending(true)
        const formData = new FormData(e.currentTarget)
        try {
            await signIn(formData)
        } catch (err) {
            // Let Next.js redirect errors bubble up
            throw err
        }
    }

    return (
        <div className="min-h-screen bg-bg flex items-center justify-center px-6 overflow-hidden relative">

            {/* ── Full-page loading overlay ── */}
            <div
                aria-live="polite"
                aria-label="Signing in"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1.5rem',
                    background: 'var(--bg)',
                    opacity: isPending ? 1 : 0,
                    pointerEvents: isPending ? 'all' : 'none',
                    transition: 'opacity 0.3s ease',
                }}
            >
                {/* Logo with pulse rings */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Outer pulse ring */}
                    <div style={{
                        position: 'absolute',
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        border: '1.5px solid rgba(99,102,241,0.3)',
                        animation: 'ping-slow 1.8s ease-out infinite',
                    }} />
                    {/* Inner pulse ring */}
                    <div style={{
                        position: 'absolute',
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        border: '1.5px solid rgba(99,102,241,0.2)',
                        animation: 'ping-slow 1.8s ease-out 0.4s infinite',
                    }} />
                    {/* Icon */}
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: '#6366f1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 24px rgba(99,102,241,0.25)',
                    }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                            <circle cx="12" cy="12" r="3" fill="white" stroke="none" />
                        </svg>
                    </div>
                </div>

                {/* Text */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Signing in
                    </p>
                    {/* Dot bounce loader */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '10px' }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{
                                width: '5px',
                                height: '5px',
                                borderRadius: '50%',
                                background: 'var(--accent)',
                                animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                            }} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Subtle ambient blobs — very muted, non-neon */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden"
            >
                <div
                    style={{
                        position: 'absolute',
                        top: '-10%',
                        right: '-5%',
                        width: '480px',
                        height: '480px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
                        animation: 'blob-drift 18s ease-in-out infinite',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-15%',
                        left: '-5%',
                        width: '560px',
                        height: '560px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
                        animation: 'blob-drift 22s ease-in-out infinite reverse',
                    }}
                />
            </div>

            {/* Form card */}
            <div
                className="relative w-full max-w-sm"
                style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0px)' : 'translateY(20px)',
                    transition: 'opacity 0.55s ease, transform 0.55s ease',
                }}
            >
                {/* Logo — animates in with a slight scale+fade */}
                <div
                    className="mb-10"
                    style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'scale(1)' : 'scale(0.88)',
                        transition: 'opacity 0.45s ease 0.1s, transform 0.45s ease 0.1s',
                    }}
                >
                    <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center mb-6 shadow-lg">
                        <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            style={{ animation: 'icon-spin 0.6s ease 0.2s both' }}
                        >
                            <circle cx="12" cy="12" r="10" />
                            <path strokeLinecap="round" d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                            <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
                        </svg>
                    </div>
                    <h1
                        className="text-2xl font-display font-semibold text-text-primary tracking-tight"
                        style={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
                            transition: 'opacity 0.4s ease 0.15s, transform 0.4s ease 0.15s',
                        }}
                    >
                        GDP Nexus
                    </h1>
                    <p
                        className="text-sm text-text-secondary mt-1"
                        style={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'translateY(0)' : 'translateY(6px)',
                            transition: 'opacity 0.4s ease 0.22s, transform 0.4s ease 0.22s',
                        }}
                    >
                        Media management platform
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {decodeURIComponent(error)}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={onSubmit} className="space-y-4">
                    {/* Email field */}
                    <div
                        style={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                            transition: 'opacity 0.4s ease 0.3s, transform 0.4s ease 0.3s',
                        }}
                    >
                        <label htmlFor="email" className="block text-xs font-medium text-text-secondary mb-1.5">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                            placeholder="you@example.com"
                            className="w-full bg-bg-subtle border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors placeholder:text-text-muted"
                        />
                    </div>

                    {/* Password field */}
                    <div
                        style={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                            transition: 'opacity 0.4s ease 0.38s, transform 0.4s ease 0.38s',
                        }}
                    >
                        <label htmlFor="password" className="block text-xs font-medium text-text-secondary mb-1.5">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className="w-full bg-bg-subtle border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors placeholder:text-text-muted"
                        />
                    </div>

                    {/* Submit button */}
                    <div
                        style={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                            transition: 'opacity 0.4s ease 0.46s, transform 0.4s ease 0.46s',
                        }}
                    >
                        <button
                            type="submit"
                            disabled={isPending}
                            className="relative w-full overflow-hidden bg-accent hover:bg-accent-hover text-white py-2.5 rounded-lg text-sm font-medium transition-colors mt-2 disabled:opacity-70 group"
                        >
                            {/* Shimmer sweep on hover */}
                            <span
                                aria-hidden
                                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
                                style={{
                                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)',
                                }}
                            />
                            <span className="relative flex items-center justify-center gap-2">
                                {isPending ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                        </svg>
                                        Signing in…
                                    </>
                                ) : 'Sign in'}
                            </span>
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <p
                    className="mt-8 text-center text-xs text-text-muted"
                    style={{
                        opacity: mounted ? 1 : 0,
                        transition: 'opacity 0.5s ease 0.55s',
                    }}
                >
                    Authorized personnel only
                </p>
            </div>

            {/* Keyframe definitions */}
            <style>{`
                @keyframes blob-drift {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33%       { transform: translate(30px, -20px) scale(1.05); }
                    66%       { transform: translate(-20px, 15px) scale(0.97); }
                }
                @keyframes icon-spin {
                    0%   { transform: rotate(-30deg) scale(0.7); opacity: 0; }
                    100% { transform: rotate(0deg) scale(1);   opacity: 1; }
                }
                @keyframes ping-slow {
                    0%   { transform: scale(0.85); opacity: 0.7; }
                    80%  { transform: scale(1.5);  opacity: 0; }
                    100% { transform: scale(1.5);  opacity: 0; }
                }
                @keyframes dot-bounce {
                    0%, 80%, 100% { transform: translateY(0);    opacity: 0.3; }
                    40%           { transform: translateY(-6px); opacity: 1; }
                }
            `}</style>
        </div>
    )
}
