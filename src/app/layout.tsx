import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { TrendingUp, Calendar, Zap, ShieldAlert } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Indian Stock Market Daily Intelligence',
  description: 'Automated post-session Indian stock market intelligence, gainers/losers analysis, and AI news catalysts.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-blue-500 selection:text-white`}>
        {/* Top Header Navigation */}
        <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-100 tracking-tight block leading-none">MarketIntel</span>
                <span className="text-xs text-blue-400 font-medium">NSE / BSE Daily Intelligence</span>
              </div>
            </Link>

            <nav className="flex items-center gap-2">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                Latest Report
              </Link>
              <Link
                href="/reports"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-blue-400" />
                Archive
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-800/60 bg-slate-950 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Automated Financial Agent for Informational Purposes Only. Not Investment Advice.</span>
            </div>
            <div>Powered by Groq API • Supabase • Vercel Cron • Resend</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
