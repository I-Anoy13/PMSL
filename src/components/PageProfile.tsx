import { UserProfile, Transaction } from '../lib/mockFirebase';
import { Award, Trophy, User, LogOut, ShieldAlert, Swords, Zap, Coins, Crosshair, Users, Crown, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';

interface PageProfileProps {
  user: UserProfile;
  transactions: Transaction[];
  onLogoutClick: () => void;
  onNavigateToTeams?: () => void;
}

// Full specifications for levels
const LEVEL_CONFIG = {
  Bronze: { icon: '🥉', title: 'Bronze', desc: 'Newcomer (0-100 total earned)', style: 'from-amber-800 to-amber-600 text-amber-100 border-amber-700/40' },
  Silver: { icon: '🥈', title: 'Silver', desc: 'Rising Star (101-500 total earned)', style: 'from-slate-500 to-slate-300 text-slate-100 border-slate-400/40' },
  Gold: { icon: '🥇', title: 'Gold', desc: 'Pro Player (501-1000 total earned)', style: 'from-yellow-600 to-yellow-400 text-yellow-950 border-yellow-500/40' },
  Diamond: { icon: '💎', title: 'Diamond', desc: 'Legend (1000+ total earned)', style: 'from-sky-500 via-[#00d4ff] to-[#00ff87] text-white border-cyan-400/50' },
};

// All achievements possible
const ACHIEVEMENTS_LIST = [
  { id: 'first_blood', icon: '🎯', title: 'First Blood', desc: 'Joined first tournament' },
  { id: 'team_player', icon: '👥', title: 'Team Player', desc: 'Joined a team' },
  { id: 'team_leader', icon: '👑', title: 'Team Leader', desc: 'Created a team' },
  { id: 'coin_collector', icon: '💰', title: 'Coin Collector', desc: 'Earned 500 coins total' },
  { id: 'champion', icon: '🏆', title: 'Champion', desc: 'Won first tournament' },
  { id: 'daily_grind', icon: '⭐', title: 'Daily Grind', desc: 'Logged in 7 days straight' }
];

export default function PageProfile({
  user,
  transactions,
  onLogoutClick,
  onNavigateToTeams
}: PageProfileProps) {
  // Calculate total coins earned historically
  const totalEarned = transactions
    .filter(tx => tx.type === 'earned')
    .reduce((sum, tx) => sum + tx.amount, 0) + 100; // start with 100 base coins

  // Determine Level config based on historical earnings
  let levelKey: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' = 'Bronze';
  if (totalEarned > 1000) levelKey = 'Diamond';
  else if (totalEarned > 500) levelKey = 'Gold';
  else if (totalEarned > 100) levelKey = 'Silver';

  const levelInfo = LEVEL_CONFIG[levelKey];

  // Dynamic achievement unlocks
  const unlockedAchievements = new Set<string>();
  
  // 1. First Blood: If user registered in at least one tournament
  const registeredTxs = transactions.some(tx => tx.source === 'tournament_entry');
  if (registeredTxs) unlockedAchievements.add('first_blood');

  // 2. Team Player: If teamId is active
  if (user.teamId) {
    unlockedAchievements.add('team_player');
  }

  // 3. Team Leader: If user created a team
  // We can track this if the user has teamId and they are captain, or if they have created a team before.
  // Since we seed this or create a team, if team exists and user is captain, unlock it
  const teamsData = JSON.parse(localStorage.getItem('pmsl_col_teams') || '[]');
  const userTeam = teamsData.find((t: any) => t.id === user.teamId);
  const isCaptain = teamsData.some((t: any) => t.captainId === user.uid);
  if (isCaptain) {
    unlockedAchievements.add('team_leader');
    unlockedAchievements.add('team_player'); // they also joined
  }

  // 4. Coin Collector: If totalEarned >= 500
  if (totalEarned >= 500) unlockedAchievements.add('coin_collector');

  // 5. Champion: If user won a tournament
  const winTxs = transactions.some(tx => tx.source === 'tournament_win');
  if (winTxs) unlockedAchievements.add('champion');

  // 6. Daily Grind: default unlocked for active simulator profiles after some activity
  if (transactions.filter(t => t.source === 'daily_bonus').length >= 1 || totalEarned > 150) {
    unlockedAchievements.add('daily_grind');
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Top Banner Card with Google avatar & Level details */}
      <div className="glass-panel border-[#00ff87]/15 p-6 flex flex-col md:flex-row gap-6 items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 h-1.5 w-full bg-gradient-to-r from-[#00ff87] to-[#00d4ff]" />

        {/* Left Side Avatar Details */}
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[#00ff87] shadow-[0_0_20px_rgba(0,255,135,0.25)]">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white font-bold text-3xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-display font-black text-white uppercase tracking-wider">{user.name}</h1>
            <p className="text-xs text-[#a0b4c8] font-mono">{user.email}</p>
            
            <div className="inline-flex items-center gap-1.5 bg-[#00ff87]/15 border border-[#00ff87]/30 px-3 py-1 rounded-full text-xs font-mono font-bold text-[#00ff87]">
              <Coins className="w-4 h-4" />
              <span>🪙 {totalEarned} Total Earned Historically</span>
            </div>
          </div>
        </div>

        {/* Right Side Level Info */}
        <div className={`p-4 rounded-2xl bg-gradient-to-tr ${levelInfo.style} border text-center space-y-1 min-w-[200px]`}>
          <div className="text-3xl">{levelInfo.icon}</div>
          <h3 className="font-display font-black text-sm uppercase tracking-widest">{levelInfo.title} tier</h3>
          <p className="text-[10px] opacity-85 leading-none max-w-[180px] mx-auto">{levelInfo.desc}</p>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="space-y-3">
        <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
          Competitive Combat Record
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Matches */}
          <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-center space-y-1 hover:border-[#00ff87]/20 transition">
            <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider block">Matches Played</span>
            <div className="text-2xl font-black font-mono text-white flex items-center justify-center gap-1.5">
              <Swords className="w-5 h-5 text-[#a0b4c8]" />
              {user.stats.matches}
            </div>
          </div>

          {/* Wins */}
          <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-center space-y-1 hover:border-[#00ff87]/20 transition">
            <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider block">Tournaments Won</span>
            <div className="text-2xl font-black font-mono text-[#00ff87] flex items-center justify-center gap-1.5">
              <Trophy className="w-5 h-5 text-[#00ff87]" />
              {user.stats.wins}
            </div>
          </div>

          {/* Kills */}
          <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-center space-y-1 hover:border-[#00ff87]/20 transition">
            <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider block">Total Finishes (Kills)</span>
            <div className="text-2xl font-black font-mono text-[#00d4ff] flex items-center justify-center gap-1.5">
              <Crosshair className="w-5 h-5 text-[#00d4ff]" />
              {user.stats.kills}
            </div>
          </div>

          {/* Top 10 */}
          <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-center space-y-1 hover:border-[#00ff87]/20 transition">
            <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider block">Top 10 Placements</span>
            <div className="text-2xl font-black font-mono text-yellow-500 flex items-center justify-center gap-1.5">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              {user.stats.top10}
            </div>
          </div>
        </div>
      </div>

      {/* My Esports Squad Section */}
      <div className="glass-panel border-white/5 p-6 space-y-4">
        <div className="border-b border-white/5 pb-3 flex items-center justify-between">
          <h3 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-[#00ff87]" />
            <span>My Esports Squad</span>
          </h3>
          {userTeam && (
            <span className="bg-[#00ff87]/15 border border-[#00ff87]/25 text-[#00ff87] text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded font-bold animate-pulse">
              Active Member
            </span>
          )}
        </div>

        {userTeam ? (
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-black/25 border border-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-950 via-slate-900 to-black border border-white/10 rounded-xl flex items-center justify-center text-3xl shadow-md">
                {userTeam.logo || '🛡️'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-display font-black text-white uppercase tracking-wide">
                    {userTeam.name}
                  </h4>
                  <span className="bg-white/15 text-white border border-white/10 text-[9px] font-mono px-1.5 py-0.2 rounded uppercase">
                    {userTeam.tag}
                  </span>
                  {userTeam.captainId === user.uid && (
                    <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[8px] font-mono px-1 py-0.2 rounded flex items-center gap-0.5 uppercase tracking-wider font-bold">
                      <Crown className="w-2.5 h-2.5 text-yellow-500" />
                      Captain
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 font-mono">
                  Invite Code: <span className="text-[#00d4ff] font-bold">{userTeam.inviteCode}</span>
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Members: {userTeam.members.length} / 5
                </p>
              </div>
            </div>

            {/* Quick stats for team */}
            <div className="flex items-center gap-6 text-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-around">
              <div>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono block">Squad Matches</span>
                <span className="text-sm font-black font-mono text-white">{userTeam.totalMatches || 0}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono block">Squad Wins</span>
                <span className="text-sm font-black font-mono text-[#00ff87]">{userTeam.totalWins || 0}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-black/15 border border-dashed border-white/5 rounded-xl space-y-3">
            <p className="text-xs text-[#a0b4c8] max-w-xs mx-auto">
              You are not registered in any esports squad. Join or create a team to compete in standard tournaments!
            </p>
            <button
              onClick={() => {
                if (onNavigateToTeams) {
                  onNavigateToTeams();
                }
              }}
              className="btn-neon-green py-2 px-5 text-[10px] uppercase font-bold tracking-wider rounded"
              id="btn-profile-navigate-teams"
            >
              Configure Squad
            </button>
          </div>
        )}
      </div>

      {/* Achievement badges section */}
      <div className="glass-panel border-white/5 p-6 space-y-6">
        <div className="border-b border-white/5 pb-3">
          <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
            Operational Achievement Badges ({unlockedAchievements.size}/6)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ACHIEVEMENTS_LIST.map((badge) => {
            const isUnlocked = unlockedAchievements.has(badge.id);
            return (
              <div 
                key={badge.id}
                className={`flex items-start gap-3 p-4.5 rounded-xl border transition-all ${
                  isUnlocked 
                    ? 'bg-[#00ff87]/5 border-[#00ff87]/25 hover:border-[#00ff87]/40 shadow-[0_0_10px_rgba(0,255,135,0.03)]' 
                    : 'bg-black/40 border-white/5 opacity-40 select-none'
                }`}
              >
                <div className="text-3xl leading-none">{badge.icon}</div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white uppercase">{badge.title}</h4>
                    {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff87]" />}
                  </div>
                  <p className="text-[10px] text-[#a0b4c8] leading-snug">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset & Logout bottom block */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to completely reset the simulated database? This will clear all teams, tournaments, and transactions.")) {
              Object.keys(localStorage).forEach(key => {
                if (key.startsWith('pmsl_')) {
                  localStorage.removeItem(key);
                }
              });
              window.location.reload();
            }
          }}
          className="flex items-center gap-2 border border-amber-500/25 hover:bg-amber-500 hover:text-white text-amber-400 font-bold text-xs tracking-wider uppercase px-8 py-3 rounded-full transition cursor-pointer"
          id="btn-profile-reset-db"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Simulator Data</span>
        </button>

        <button
          onClick={onLogoutClick}
          className="flex items-center gap-2 border border-rose-500/25 hover:bg-rose-500 hover:text-white text-rose-400 font-bold text-xs tracking-wider uppercase px-8 py-3 rounded-full transition cursor-pointer"
          id="btn-profile-logout"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Session</span>
        </button>
      </div>
    </div>
  );
}
