// app/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { signIn } from '@/app/actions/auth'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  // If already logged in, skip straight to dashboard
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground selection:bg-cyan-neon/30 p-6">
        {/* Background Ambience */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-neon/5 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-neon/5 blur-[120px] rounded-full animate-pulse [animation-delay:2s]"></div>
        </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Brand HUD */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-cyan-neon mb-6 shadow-[0_0_50px_rgba(0,245,255,0.3)] group transition-all duration-700 hover:rotate-[180deg]">
            <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tighter uppercase mb-2">
            GDP <span className="text-cyan-neon">NEXUS</span>
          </h1>
          <div className="flex items-center justify-center gap-3">
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em]">Media Management Suite</span>
              <span className="w-1 h-1 bg-white/20 rounded-full"></span>
              <span className="text-[10px] font-mono text-cyan-neon uppercase tracking-[0.3em] animate-pulse">System Access</span>
          </div>
        </div>

        {/* Error Banner HUD */}
        {error && (
          <div className="mb-8 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-mono font-bold uppercase tracking-widest flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {decodeURIComponent(error)}
          </div>
        )}

        {/* Login Form Card */}
        <div className="glass rounded-[3rem] border border-white/5 shadow-2xl p-10 relative overflow-hidden group">
            {/* HUD Scanning Line */}
            <div className="absolute top-0 left-0 w-full h-px bg-cyan-neon/20 animate-scan pointer-events-none"></div>
            
            <form action={signIn} className="space-y-8">
                <div className="space-y-3">
                    <label htmlFor="email" className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">
                        Email Address
                    </label>
                    <div className="relative group/input">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                            placeholder="user@gdpnexus.com"
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 text-white outline-none focus:border-cyan-neon focus:bg-white/[0.08] transition-all placeholder:text-white/10 font-mono text-sm tracking-tight"
                        />
                        <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label htmlFor="password" className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] ml-2">
                        Password
                    </label>
                    <div className="relative group/input">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 text-white outline-none focus:border-cyan-neon focus:bg-white/[0.08] transition-all placeholder:text-white/10 font-mono text-sm"
                        />
                        <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-cyan-neon text-black py-6 rounded-2xl font-display font-bold text-sm shadow-[0_0_40px_rgba(0,245,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-4 group/btn"
                >
                    Sign In
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
            </form>
            
            {/* Technical Metadata Footer */}
            <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Secure Access</span>
                    <span className="text-[9px] font-mono text-cyan-neon/60 font-bold uppercase tracking-widest">Standard Encryption</span>
                </div>
                <div className="text-right flex flex-col">
                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">System Status</span>
                    <span className="text-[9px] font-mono text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1.5 justify-end">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                        Connected
                    </span>
                </div>
            </div>
        </div>
        
        {/* Secondary Subtext */}
        <p className="mt-12 text-center text-[9px] font-mono text-white/10 uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed">
            Unauthorized access to GDP Nexus is strictly prohibited.
        </p>
      </div>
    </div>
  )
}
