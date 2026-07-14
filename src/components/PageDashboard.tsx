import { Coins, Users, Plus, UserPlus, Trophy, Swords, Zap, Award, Activity, Copy, Clock, LogOut } from 'lucide-react';
import { UserProfile, Team, Transaction } from '../lib/mockFirebase';

interface PageDashboardProps {
  user: UserProfile;
  team: Team | null;
  recentTransactions: Transaction[];
  onEarnCoinsClick: () => void;
  onCreateTeamClick: () => void;
  onJoinTeamClick: () => void;
  onCopyCode: (code: string) => void;
}

export default function PageDashboard({
  user,
  team,
  recentTransactions,
  onEarnCoinsClick,
  onCreateTeamClick,
  onJoinTeamClick,
  onCopyCode
}: PageDashboardProps) {
  // Sort and filter top 5 recent transactions
  const topTransactions = recentTransactions.slice(0, 5);

  return (
    <div className="space-y-8 py-6">
      {/* Welcome header with Google Avatar & Rank Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#00ff87] shadow-[0_0_15px_rgba(0,255,135,0.2)]">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-display font-black tracking-wide text-white uppercase">
                Welcome back, {user.name}!
              </h1>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                user.level === 'Bronze' ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30' :
                user.level === 'Silver' ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                user.level === 'Gold' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 animate-pulse' :
                'bg-sky-400/20 text-[#00d4ff] border border-sky-400/30 font-bold'
              }`}>
                {user.level} Rank
              </span>
            </div>
            <p className="text-xs text-[#a0b4c8]">Lobby Protocol: Online | Email: {user.email}</p>
          </div>
        </div>

        {/* Quick actions right block */}
        <div className="flex items-center gap-4">
          <button
            onClick={onEarnCoinsClick}
            className="action-btn px-6 py-3 rounded-full text-[10px] tracking-widest font-black uppercase flex items-center gap-1.5 animate-pulse"
            id="btn-dash-earn"
          >
            <Coins className="w-4 h-4" />
            <span>Earn Coins</span>
          </button>
        </div>
      </div>

      {/* Main Stats, Balance & Team Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Balance, Team, Stats (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Top Row: Coin Balance and Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Balance Card */}
            <div className="glass-panel border-[#00ff87]/20 p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 text-[#00ff87]/10 pointer-events-none">
                <Coins className="w-24 h-24 stroke-[1.5px]" />
              </div>
              <div className="space-y-1 z-10">
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">CURRENT COIN BALANCE</span>
                <div className="text-3xl font-black font-mono text-[#00ff87] flex items-center gap-1">
                  🪙 {user.coins}
                </div>
              </div>
              <div className="pt-4 z-10">
                <p className="text-[11px] text-[#a0b4c8] leading-normal">
                  Use your coins to register for premium custom tournaments. Every visual ad watch claims <strong>+15 coins</strong>.
                </p>
              </div>
            </div>

            {/* Quick stats box */}
            <div className="glass-panel border-[#00d4ff]/20 p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 text-[#00d4ff]/10 pointer-events-none">
                <Award className="w-24 h-24 stroke-[1.5px]" />
              </div>
              <div className="space-y-1 z-10">
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">SQUAD HIGHLIGHTS</span>
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="bg-black/30 border border-white/5 p-1.5 rounded">
                    <span className="text-[10px] text-slate-500 block">Matches</span>
                    <span className="text-sm font-black font-mono text-white">{user.stats.matches}</span>
                  </div>
                  <div className="bg-black/30 border border-white/5 p-1.5 rounded">
                    <span className="text-[10px] text-slate-500 block">Wins</span>
                    <span className="text-sm font-black font-mono text-[#00ff87]">{user.stats.wins}</span>
                  </div>
                  <div className="bg-black/30 border border-white/5 p-1.5 rounded">
                    <span className="text-[10px] text-slate-500 block">Kills</span>
                    <span className="text-sm font-black font-mono text-[#00d4ff]">{user.stats.kills}</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 z-10">
                <div className="flex items-center justify-between text-[10px] text-[#a0b4c8]">
                  <span>Total Top 10 Finishes:</span>
                  <span className="font-bold text-white">{user.stats.top10}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="glass-panel border-[#00ff87]/15 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00ff87]" />
                <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
                  My Esports Team
                </h3>
              </div>
              {team && (
                <span className="text-[10px] bg-[#00ff87]/15 text-[#00ff87] border border-[#00ff87]/20 px-2 py-0.5 rounded font-mono">
                  SQUAD RATIO {team.members.length}/5
                </span>
              )}
            </div>

            {team ? (
              <div className="space-y-4">
                {/* Team Info Card */}
                <div className="flex items-center justify-between bg-black/40 border border-white/5 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-950 to-slate-900 border border-white/10 rounded-lg flex items-center justify-center text-3xl shadow-inner">
                      {team.logo || '🛡️'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-display font-bold text-base text-white">{team.name}</h4>
                        <span className="text-xs bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/20 px-1.5 py-0.2 rounded font-mono font-bold uppercase">
                          {team.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#a0b4c8] flex items-center gap-1 mt-0.5">
                        <span>Captain UID:</span>
                        <span className="font-mono text-slate-400 text-[10px]">{team.captainId}</span>
                      </p>
                    </div>
                  </div>

                  {/* Copy Invite Code Block */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider">Squad Invite Code</span>
                    <button
                      onClick={() => onCopyCode(team.inviteCode)}
                      className="flex items-center gap-1.5 bg-black/50 hover:bg-black/80 border border-white/10 hover:border-[#00ff87]/50 px-2.5 py-1.5 rounded text-[10px] font-mono text-white transition"
                      title="Copy invite code"
                      id="btn-copy-team-code"
                    >
                      <span>{team.inviteCode}</span>
                      <Copy className="w-3 h-3 text-[#00ff87]" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Share your unique squad invite code to recruit teammates. High squad activity wins custom leagues faster.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <p className="text-[#a0b4c8] text-xs max-w-md mx-auto">
                  You are not currently enrolled in any PUBG Mobile Esports Squad. To participate in custom lobby tournaments, you must create or join an active squad first!
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={onCreateTeamClick}
                    className="btn-neon-green flex items-center gap-1.5 py-2 px-4 rounded text-xs font-bold"
                    id="btn-dash-create-team"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Team</span>
                  </button>
                  <button
                    onClick={onJoinTeamClick}
                    className="btn-neon-cyan flex items-center gap-1.5 py-2 px-4 rounded text-xs font-bold"
                    id="btn-dash-join-team"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Join Team</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Recent Activity Feed (Col span 5) */}
        <div className="lg:col-span-5">
          <div className="glass-panel border-[#00d4ff]/15 p-6 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Activity className="w-4 h-4 text-[#00d4ff]" />
                <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
                  Recent Wallet Activity
                </h3>
              </div>

              <div className="divide-y divide-white/5">
                {topTransactions.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs italic">
                    No wallet actions recorded. Watch ads to claim starter balances.
                  </div>
                ) : (
                  topTransactions.map((tx) => {
                    const isCredit = tx.type === 'earned';
                    return (
                      <div key={tx.id} className="py-3 flex items-center justify-between text-xs hover:bg-white/1 px-1 rounded transition">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-white leading-snug">{tx.description}</p>
                          <span className="text-[9px] text-slate-500 font-mono block">
                            {tx.source.toUpperCase()} | {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className={`font-mono font-bold text-xs ${isCredit ? 'text-[#00ff87]' : 'text-rose-400'}`}>
                          {isCredit ? '+' : '-'}{tx.amount} 🪙
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 mt-4">
              <div className="bg-black/30 border border-white/5 rounded-lg p-3 text-center text-[10px] text-slate-400 flex items-center gap-1.5 justify-center">
                <Clock className="w-3.5 h-3.5 text-[#00d4ff]" />
                <span>Daily limits refresh at 00:00 UTC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
