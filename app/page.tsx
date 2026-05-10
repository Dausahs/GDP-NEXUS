// app/page.tsx — Login page (minimal redesign)
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { signIn } from '@/app/actions/auth'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-10">
          <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center mb-6">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <h1 className="text-2xl font-display font-semibold text-text-primary tracking-tight">
            GDP Nexus
          </h1>
          <p className="text-sm text-text-secondary mt-1">Media management platform</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {decodeURIComponent(error)}
          </div>
        )}

        {/* Form */}
        <form action={signIn} className="space-y-4">
          <div>
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

          <div>
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

          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 rounded-lg text-sm font-medium transition-colors mt-2"
          >
            Sign in
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-text-muted">
          Authorized personnel only
        </p>
      </div>
    </div>
  )
}
