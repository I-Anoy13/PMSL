import { Swords, Trophy, Shield, Heart } from 'lucide-react';

interface FooterProps {
  setActivePage: (page: string) => void;
}

export default function Footer({ setActivePage }: FooterProps) {
  return (
    <footer className="border-t border-[#00ff87]/10 bg-[#0a0e17]/95 relative z-10 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Brand column */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00ff87] to-[#00d4ff] flex items-center justify-center font-bold text-[#0a0e17] shadow-lg">
                <span className="font-display">P</span>
              </div>
              <span className="font-display font-black tracking-widest text-lg text-white">PMSL</span>
            </div>
            <p className="text-[#a0b4c8] text-xs leading-relaxed max-w-sm">
              The premium PUBG Mobile Tournament hub. Participate in daily custom lobby scrambles, claim epic prize pools, build elite squads, and master your competitive stats.
            </p>
          </div>

          {/* Quick links columns */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-white mb-3">Navigator</h4>
            <ul className="space-y-2 text-xs text-[#a0b4c8]">
              <li>
                <button onClick={() => setActivePage('home')} className="hover:text-[#00ff87] transition">Home Arena</button>
              </li>
              <li>
                <button onClick={() => setActivePage('tournaments')} className="hover:text-[#00ff87] transition">Active Tournaments</button>
              </li>
              <li>
                <button onClick={() => setActivePage('teams')} className="hover:text-[#00ff87] transition">Elite Squads</button>
              </li>
              <li>
                <button onClick={() => setActivePage('earn-coins')} className="hover:text-[#00ff87] transition">Coin Refinery</button>
              </li>
            </ul>
          </div>

          {/* Rules/Legal column */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-white mb-3">Tournament Fair-Play</h4>
            <ul className="space-y-2 text-xs text-[#a0b4c8]">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#00ff87]" />
                <span>Anti-Cheat Verified</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#00d4ff]" />
                <span>Instant Wallet Payouts</span>
              </li>
              <li className="text-[10px] text-slate-500 leading-snug">
                This platform is purely an ad-reward and tournament simulator. In-game names and characters are properties of Krafton & Tencent Games.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom border block */}
        <div className="border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#a0b4c8] text-xs">
            &copy; {new Date().getFullYear()} PMSL Tournament Platform. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <span>Simulated and crafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#00ff87] fill-[#00ff87]" />
            <span>for PUBG Mobile Players</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
