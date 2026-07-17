import { useState } from 'react';
import { Coins, Play, Trophy, ShieldAlert, Key, Clipboard, Users, CheckCircle2, Clock, Calendar, Check, ExternalLink } from 'lucide-react';
import { UserProfile, Transaction } from '../lib/mockFirebase';

interface PageEarnCoinsProps {
  user: UserProfile;
  transactions: Transaction[];
  onWatchAdClick: () => void;
  onClaimDaily: () => void;
  hasClaimedDaily: boolean;
  onCopyReferral: (code: string) => void;
}

export default function PageEarnCoins({
  user,
  transactions,
  onWatchAdClick,
  onClaimDaily,
  hasClaimedDaily,
  onCopyReferral
}: PageEarnCoinsProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  // Take last 10 transactions for the table
  const tableTransactions = transactions.slice(0, 10);

  const handleCopyRefLink = () => {
    const link = `${window.location.origin}?ref=${user.referralCode}`;
    onCopyReferral(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      {/* Top section: Balance and Watch Ad Pulsing Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Balance and Counter (Col span 5) */}
        <div className="md:col-span-5 glass-panel border-[#00ff87]/15 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-[#00ff87]/5 pointer-events-none">
            <Coins className="w-40 h-40" />
          </div>
          
          <div className="space-y-4 z-10">
            <div>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">CURRENT COIN WALLET</span>
              <h2 className="text-4xl font-black font-mono text-white flex items-center gap-2 mt-1">
                🪙 <span className="text-[#00ff87] animate-pulse">{user.coins}</span>
              </h2>
            </div>

            <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Daily Transmissions Watched:</span>
                <span className="font-bold text-white font-mono">{user.adsWatchedToday}/5</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-[#00ff87] rounded-full transition-all duration-300 shadow-[0_0_8px_#00ff87]" 
                  style={{ width: `${(user.adsWatchedToday / 5) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 italic pt-1">
                Watching visual ad sponsors awards <strong>+15 coins</strong> each. Limit: 5 daily.
              </p>
            </div>
          </div>
        </div>

        {/* Watch Ad Trigger Big Button (Col span 7) */}
        <div className="md:col-span-7 glass-panel-cyan p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/5 to-transparent pointer-events-none" />

          <div className="space-y-4 max-w-sm relative z-10">
            <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
              Visual Sponsorship Refinery
            </h3>
            <p className="text-xs text-[#a0b4c8] leading-relaxed">
              Launch a high-fidelity 6-second sponsor broadcast. Resolving the transmission safely awards coins to your account.
            </p>

            <button
              onClick={onWatchAdClick}
              disabled={user.adsWatchedToday >= 5}
              className={`w-full py-4 px-8 rounded-full text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2.5 ${
                user.adsWatchedToday >= 5
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  : 'action-btn animate-pulse hover:scale-102 shadow-[0_0_20px_rgba(0,255,135,0.3)]'
              }`}
              id="btn-earn-watch-ad"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{user.adsWatchedToday >= 5 ? 'Daily limit reached' : 'WATCH AD (+15 Coins)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of other ways to earn */}
      <div className="space-y-4">
        <h3 className="font-display font-black text-sm text-white uppercase tracking-wider border-b border-white/5 pb-2">
          Alternative Coin Pipelines
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Way 1: Win Tournament */}
          <div className="glass-panel border-[#00ff87]/10 p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white uppercase">Win Tournament</h4>
                <p className="text-[11px] text-[#a0b4c8] leading-relaxed">
                  Conquer custom tournament lobbies and rank 1st place to claim major payouts.
                </p>
              </div>
            </div>
            <div className="text-xs font-bold text-[#00ff87] font-mono flex items-center justify-between border-t border-white/5 pt-3">
              <span>EST. REWARD</span>
              <span>+100 Coins</span>
            </div>
          </div>

          {/* Way 2: Daily Login */}
          <div className="glass-panel border-[#00ff87]/10 p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00ff87]/10 border border-[#00ff87]/20 flex items-center justify-center text-[#00ff87]">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white uppercase">Daily Login Bonus</h4>
                <p className="text-[11px] text-[#a0b4c8] leading-relaxed">
                  Return every day to claim your operational daily subsidy.
                </p>
              </div>
            </div>
            <div className="border-t border-white/5 pt-3 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-bold">REWARD: +10 Coins</span>
              {hasClaimedDaily ? (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                  Claimed
                </span>
              ) : (
                <button
                  onClick={onClaimDaily}
                  className="bg-[#00ff87] hover:bg-[#00ff87]/80 text-[#0a0e17] text-[10px] font-bold px-2.5 py-1 rounded uppercase transition"
                  id="btn-claim-daily"
                >
                  Claim
                </button>
              )}
            </div>
          </div>

          {/* Way 3: Refer Friend */}
          <div className="glass-panel border-[#00ff87]/10 p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff]">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white uppercase">Refer Friend</h4>
                <p className="text-[11px] text-[#a0b4c8] leading-relaxed">
                  Share your referral hyperlink with teammates to earn rewards.
                </p>
              </div>
            </div>
            <div className="border-t border-white/5 pt-3 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">CODE: {user.referralCode}</span>
              <button
                onClick={handleCopyRefLink}
                className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase transition"
                id="btn-refer-friend"
              >
                {copiedLink ? <Check className="w-3 h-3 text-[#00ff87]" /> : <ExternalLink className="w-3 h-3" />}
                <span>{copiedLink ? 'Copied' : 'Invite'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Transaction History Table */}
      <div className="glass-panel border-white/5 p-6 space-y-4">
        <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
          Transaction Ledger History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
                <th className="py-3 px-2">Date / Time</th>
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2 hidden sm:table-cell">Category</th>
                <th className="py-3 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tableTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 italic">
                    No transactions reported yet.
                  </td>
                </tr>
              ) : (
                tableTransactions.map((tx) => {
                  const isCredit = tx.type === 'earned';
                  return (
                    <tr key={tx.id} className="hover:bg-white/1 transition">
                      <td className="py-3 px-2 text-slate-400 font-mono text-[11px]">
                        {new Date(tx.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-2 font-semibold text-white">
                        {tx.description}
                      </td>
                      <td className="py-3 px-2 hidden sm:table-cell">
                        <span className="bg-slate-800 text-slate-400 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded">
                          {tx.source}
                        </span>
                      </td>
                      <td className={`py-3 px-2 text-right font-bold font-mono text-sm ${isCredit ? 'text-[#00ff87]' : 'text-rose-400'}`}>
                        {isCredit ? '+' : '-'}{tx.amount} 🪙
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
