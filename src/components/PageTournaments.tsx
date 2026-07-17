import React, { useState } from 'react';
import { Calendar, Trophy, Coins, Users, Clock, AlertTriangle, Swords, ShieldCheck, Play, Sparkles, X } from 'lucide-react';
import { Tournament, Team, UserProfile } from '../lib/mockFirebase';
import TournamentCard from './TournamentCard';

interface PageTournamentsProps {
  tournaments: Tournament[];
  teams: Team[];
  userTeamId: string | null;
  onRegisterTournament: (id: string) => void;
  onSelectTournament: (id: string) => void;
  selectedTournament: Tournament | null;
  onCloseDetails: () => void;
  user: UserProfile | null;
  onTriggerAdGate: (tourId: string, onReward: () => void) => void;
  hasWatchedResultsFor: string[]; // array of tournamentIds
}

// Fixed Match Schedule simulator for aesthetic realism
const MATCH_SCHEDULES = [
  { time: '18:00 UTC', map: 'Erangel (TPP)', description: 'Match 1 - Qualification Scramble' },
  { time: '18:45 UTC', map: 'Miramar (TPP)', description: 'Match 2 - Desert Sniper Cross' },
  { time: '19:30 UTC', map: 'Sanhok (TPP)', description: 'Match 3 - Final Circle Battle' }
];

export default function PageTournaments({
  tournaments,
  teams,
  userTeamId,
  onRegisterTournament,
  onSelectTournament,
  selectedTournament,
  onCloseDetails,
  user,
  onTriggerAdGate,
  hasWatchedResultsFor
}: PageTournamentsProps) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');

  // Filter tournaments list
  const filteredTournaments = tournaments.filter((tour) => {
    if (filter === 'all') return true;
    return tour.status === filter;
  });

  // Resolve team object from teamId
  const getTeamObj = (teamId: string) => {
    return teams.find((t) => t.id === teamId);
  };

  // Check if current user watched the ad gate for this completed tournament
  const isResultsUnlocked = (tourId: string) => {
    return hasWatchedResultsFor.includes(tourId);
  };

  // Trigger Ad Watch Gate
  const handleViewResultsClick = (tourId: string) => {
    onTriggerAdGate(tourId, () => {
      // Success callback - results will unlock
    });
  };

  return (
    <div className="space-y-8 py-6">
      {/* Title & Filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-wider">
            Tournaments Arena
          </h1>
          <p className="text-xs text-[#a0b4c8]">Register for premium lobbies or review completed championship scores.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'upcoming', 'ongoing', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`text-[10px] uppercase tracking-wider font-bold font-display px-3 py-1.5 rounded transition ${
                filter === status
                  ? 'bg-[#00ff87] text-[#0a0e17] shadow-[0_0_15px_rgba(0,255,135,0.15)]'
                  : 'bg-black/40 text-[#a0b4c8] hover:text-white border border-white/5'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of tournament cards */}
      {filteredTournaments.length === 0 ? (
        <div className="text-center p-16 glass-panel border-[#00ff87]/10">
          <p className="text-[#a0b4c8] text-sm italic">No tournaments found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tour) => (
            <TournamentCard
              key={tour.id}
              tournament={tour}
              teams={teams}
              userTeamId={userTeamId}
              onRegister={onRegisterTournament}
              onSelect={onSelectTournament}
              isRegistered={userTeamId ? tour.registeredTeams.includes(userTeamId) : false}
            />
          ))}
        </div>
      )}

      {/* Detail overlay Modal */}
      {selectedTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="glass-panel border-[#00ff87]/20 w-full max-w-2xl relative rounded-2xl overflow-hidden flex flex-col max-h-[90vh] my-8 animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-[#0a0e17] px-6 py-4 border-b border-white/5 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-tr from-[#00ff87] to-[#00d4ff] flex items-center justify-center font-bold text-black text-sm">
                  🏆
                </div>
                <div>
                  <h3 className="font-display font-black text-sm text-white uppercase tracking-wider line-clamp-1">
                    {selectedTournament.name}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">STATUS: {selectedTournament.status.toUpperCase()}</span>
                </div>
              </div>

              {/* Close Icon Button */}
              <button
                onClick={onCloseDetails}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono block">League Briefing</span>
                <p className="text-xs text-[#a0b4c8] leading-relaxed">{selectedTournament.description}</p>
              </div>

              {/* Grid detail metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-black/30 border border-white/5 p-3 rounded-xl text-center">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-500 uppercase">Prize Pool</span>
                  <span className="text-xs font-black font-mono text-[#00ff87] block">🏆 {selectedTournament.prizePool} Coins</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-500 uppercase">Entry Fee</span>
                  <span className="text-xs font-black font-mono text-[#00d4ff] block">💰 {selectedTournament.entryFee} Coins</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-500 uppercase">Squad Cap</span>
                  <span className="text-xs font-black font-mono text-white block">👥 {selectedTournament.maxTeams} Max</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-500 uppercase">Schedule</span>
                  <span className="text-xs font-black font-mono text-slate-300 block">⚡ 3 Matches</span>
                </div>
              </div>

              {/* Schedule and registered squads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Schedule list */}
                <div className="space-y-3">
                  <h4 className="font-display font-bold text-xs uppercase tracking-widest text-[#00d4ff]">
                    Match Schedule
                  </h4>
                  <div className="space-y-2.5">
                    {MATCH_SCHEDULES.map((match, i) => (
                      <div key={i} className="bg-black/25 border border-white/5 p-2.5 rounded-lg flex items-center justify-between text-[11px]">
                        <div>
                          <p className="font-bold text-white">{match.description}</p>
                          <span className="text-slate-500 text-[10px]">{match.map}</span>
                        </div>
                        <span className="text-[#00d4ff] font-mono font-bold">{match.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Registered Squads List */}
                <div className="space-y-3">
                  <h4 className="font-display font-bold text-xs uppercase tracking-widest text-[#00ff87]">
                    Enrolled Teams ({selectedTournament.registeredTeams.length})
                  </h4>
                  {selectedTournament.registeredTeams.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No teams enrolled yet. Claim your spot!</p>
                  ) : (
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {selectedTournament.registeredTeams.map((tid) => {
                        const squad = getTeamObj(tid);
                        return (
                          <div key={tid} className="bg-black/25 border border-white/5 p-2 rounded-lg flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2">
                              <span>{squad?.logo || '🛡️'}</span>
                              <span className="font-bold text-white">{squad?.name || 'Wolfpack'}</span>
                            </div>
                            <span className="text-slate-500 font-mono uppercase text-[9px]">[{squad?.tag || 'WP'}]</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* RESULTS SECTION (Ad Gate logic!) */}
              {selectedTournament.status === 'completed' && (
                <div className="border-t border-white/10 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-black text-xs uppercase tracking-widest text-yellow-500 flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span>Podium Tournament Results</span>
                    </h4>
                  </div>

                  {isResultsUnlocked(selectedTournament.id) ? (
                    <div className="bg-gradient-to-tr from-[#00ff87]/5 via-black/40 to-yellow-500/5 border border-yellow-500/20 rounded-xl p-4.5 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center items-stretch sm:items-end">
                        {/* Runner Up */}
                        <div className="order-2 sm:order-1 bg-black/35 border border-white/5 p-3 rounded-lg flex flex-col justify-center items-center sm:mt-4">
                          <span className="text-xl">🥈</span>
                          <span className="text-[10px] text-slate-400 font-mono block">2nd Place</span>
                          <span className="text-xs font-bold text-white mt-1">
                            {getTeamObj(selectedTournament.results?.runnerUp || '')?.name || 'Neon Titans'}
                          </span>
                        </div>

                        {/* Winner */}
                        <div className="order-1 sm:order-2 bg-[#00ff87]/5 border-2 border-[#00ff87]/30 p-4 rounded-xl flex flex-col justify-center items-center shadow-lg relative sm:-translate-y-2">
                          <span className="text-3xl">🥇</span>
                          <span className="text-[10px] text-[#00ff87] font-mono block uppercase font-black">CHAMPION</span>
                          <span className="text-sm font-black text-white mt-1">
                            {getTeamObj(selectedTournament.results?.winner || '')?.name || 'Alpha Wolves'}
                          </span>
                        </div>

                        {/* Third */}
                        <div className="order-3 sm:order-3 bg-black/35 border border-white/5 p-3 rounded-lg flex flex-col justify-center items-center sm:mt-4">
                          <span className="text-xl">🥉</span>
                          <span className="text-[10px] text-slate-400 font-mono block">3rd Place</span>
                          <span className="text-xs font-bold text-white mt-1">
                            {getTeamObj(selectedTournament.results?.third || '')?.name || 'Sanhok Snakes'}
                          </span>
                        </div>
                      </div>

                      <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-white/5">
                        Prize coins have been credited to the winning squads automatically.
                      </div>
                    </div>
                  ) : (
                    <div className="bg-black/50 border border-yellow-500/10 rounded-xl p-6 text-center space-y-4 relative overflow-hidden">
                      <div className="space-y-1.5 relative z-10 max-w-sm mx-auto">
                        <h5 className="font-bold text-xs text-white uppercase">Results Gated by Sponsor</h5>
                        <p className="text-[11px] text-[#a0b4c8] leading-relaxed">
                          To protect tournament data and support host servers, please resolve a quick sponsor transmission to unlock results.
                        </p>
                      </div>

                      <button
                        onClick={() => handleViewResultsClick(selectedTournament.id)}
                        className="btn-neon-green flex items-center gap-2 py-2.5 px-6 rounded text-xs font-bold uppercase tracking-wider mx-auto shadow-md"
                        id="btn-gate-watch-ad"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Watch Ad to Unlock Results</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
