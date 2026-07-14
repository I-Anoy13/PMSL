import React from 'react';
import { Trophy, Calendar, Sparkles, Play, ShieldAlert, ArrowLeft, ArrowRight, Medal, Users } from 'lucide-react';
import { Tournament, Team, UserProfile } from '../lib/mockFirebase';

interface PageResultsProps {
  tournaments: Tournament[];
  teams: Team[];
  onTriggerAdGate: (tourId: string, onReward: () => void) => void;
  hasWatchedResultsFor: string[];
}

export default function PageResults({
  tournaments,
  teams,
  onTriggerAdGate,
  hasWatchedResultsFor
}: PageResultsProps) {
  // Get only completed tournaments
  const completedTournaments = tournaments.filter(t => t.status === 'completed');

  // Resolve team details
  const getTeamObj = (teamId: string | null) => {
    if (!teamId) return null;
    return teams.find(t => t.id === teamId) || null;
  };

  const isResultsUnlocked = (tourId: string) => {
    return hasWatchedResultsFor.includes(tourId);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-5">
        <h1 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-wider flex items-center gap-2.5">
          <Trophy className="w-6 h-6 text-[#00ff87]" />
          <span>Esports Champions Board</span>
        </h1>
        <p className="text-xs text-[#a0b4c8] mt-1">
          Explore past custom lobbies, certified tournament scoreboards, and podium statistics.
        </p>
      </div>

      {completedTournaments.length === 0 ? (
        /* Empty State */
        <div className="glass-panel border-[#00d4ff]/15 p-10 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 bg-[#00d4ff]/10 border border-[#00d4ff]/25 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-md">
            🏁
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">No Past Results Yet</h3>
            <p className="text-xs text-[#a0b4c8] leading-relaxed max-w-sm mx-auto">
              As soon as custom match lobbies are created by administrators and marked as completed, their final placements and team stats will be updated here in real time.
            </p>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            STATUS: WAITING FOR COMPLETED MATCHES
          </div>
        </div>
      ) : (
        /* Results list */
        <div className="space-y-6">
          {completedTournaments.map((tour) => {
            const unlocked = isResultsUnlocked(tour.id);
            const winner = getTeamObj(tour.results?.winner);
            const runnerUp = getTeamObj(tour.results?.runnerUp);
            const third = getTeamObj(tour.results?.third);

            return (
              <div 
                key={tour.id} 
                className="glass-panel border-white/5 p-5 md:p-6 space-y-6 relative overflow-hidden"
              >
                {/* Glowing subtle gradient underlay */}
                <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-yellow-500 via-[#00ff87] to-cyan-500" />
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div className="space-y-1">
                    <h3 className="font-display font-black text-base text-white uppercase tracking-wide">
                      {tour.name}
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(tour.date).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        {tour.registeredTeams.length} Enrolled
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#00ff87]/10 border border-[#00ff87]/30 px-3.5 py-1.5 rounded-lg text-right">
                    <span className="text-[9px] text-slate-400 block uppercase font-mono leading-none">Championship Prize</span>
                    <span className="text-sm font-black font-mono text-[#00ff87]">🪙 {tour.prizePool} Coins</span>
                  </div>
                </div>

                {unlocked ? (
                  /* 3D-styled Podium Board */
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-3 gap-3 md:gap-5 pt-4 max-w-2xl mx-auto items-end">
                      
                      {/* 2nd Place: Left side */}
                      <div className="flex flex-col items-center">
                        <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shadow-md">
                          🥈
                        </div>
                        <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-center mt-3 h-28 flex flex-col justify-between shadow-inner">
                          <div>
                            <span className="text-[8px] text-slate-400 font-mono uppercase tracking-widest block font-bold">2nd Place</span>
                            <span className="text-xs font-black text-white block mt-1 line-clamp-1">
                              {runnerUp?.name || 'Teammates'}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#00d4ff] font-bold font-mono uppercase">
                            [{runnerUp?.tag || 'NT'}]
                          </span>
                        </div>
                      </div>

                      {/* 1st Place Champion: Center */}
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-300 border-2 border-yellow-400 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(234,179,8,0.25)] relative animate-pulse">
                          🥇
                          <span className="absolute -top-3 text-xs">👑</span>
                        </div>
                        <div className="w-full bg-yellow-500/5 border-2 border-yellow-500/30 rounded-2xl p-4 text-center mt-3 h-36 flex flex-col justify-between shadow-lg">
                          <div>
                            <span className="text-[9px] text-[#00ff87] font-mono uppercase tracking-widest block font-black">CHAMPION</span>
                            <span className="text-sm font-black text-white block mt-1.5 line-clamp-1">
                              {winner?.name || 'Alpha Wolves'}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="bg-[#00ff87]/15 text-[#00ff87] text-[8px] font-mono px-2 py-0.5 rounded font-black tracking-widest">
                              [{winner?.tag || 'AW'}]
                            </span>
                            <span className="text-[9.5px] text-yellow-500 font-bold font-mono block mt-1">
                              🏆 WINNER
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 3rd Place: Right side */}
                      <div className="flex flex-col items-center">
                        <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shadow-md">
                          🥉
                        </div>
                        <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-center mt-3 h-28 flex flex-col justify-between shadow-inner">
                          <div>
                            <span className="text-[8px] text-slate-400 font-mono uppercase tracking-widest block font-bold">3rd Place</span>
                            <span className="text-xs font-black text-white block mt-1 line-clamp-1">
                              {third?.name || 'Squad'}
                            </span>
                          </div>
                          <span className="text-[10px] text-amber-600 font-bold font-mono uppercase">
                            [{third?.tag || 'SS'}]
                          </span>
                        </div>
                      </div>

                    </div>

                    <div className="bg-black/30 border border-white/5 p-4 rounded-xl text-center text-xs text-[#a0b4c8] max-w-lg mx-auto">
                      🪙 <strong className="text-white">{tour.prizePool} coin rewards</strong> have been distributed directly to the squad captain <span className="text-yellow-500 font-bold font-mono">({winner ? getTeamObj(tour.results?.winner)?.name : 'Champion'})</span> for division among members.
                    </div>
                  </div>
                ) : (
                  /* Ad Lock screen */
                  <div className="bg-black/50 border border-yellow-500/10 rounded-xl p-8 text-center space-y-4 relative overflow-hidden">
                    <div className="space-y-1.5 max-w-md mx-auto">
                      <h4 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center justify-center gap-1.5 text-yellow-500">
                        <Medal className="w-4 h-4 text-yellow-500" />
                        <span>Sponsor-Gated Scoreboard</span>
                      </h4>
                      <p className="text-xs text-[#a0b4c8] leading-relaxed">
                        To sustain server hosting and credit team rewards, please watch a quick sponsor broadcast to unlock the podium scores.
                      </p>
                    </div>

                    <button
                      onClick={() => onTriggerAdGate(tour.id, () => {})}
                      className="btn-neon-green flex items-center gap-2 py-3 px-8 rounded text-xs font-bold uppercase tracking-wider mx-auto shadow-md"
                    >
                      <Play className="w-4 h-4 fill-current text-black" />
                      <span>Unlock Podium Results</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
