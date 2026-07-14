import React from 'react';
import { Calendar, Trophy, Coins, Users, Clock, AlertTriangle, Swords } from 'lucide-react';
import { Tournament, Team } from '../lib/mockFirebase';

interface TournamentCardProps {
  tournament: Tournament;
  teams: Team[];
  userTeamId: string | null;
  onRegister: (id: string) => void;
  onSelect: (id: string) => void;
  isRegistered: boolean;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  teams,
  userTeamId,
  onRegister,
  onSelect,
  isRegistered
}) => {
  const registeredCount = tournament.registeredTeams.length;
  const isFull = registeredCount >= tournament.maxTeams;
  const fillPercentage = Math.min(100, (registeredCount / tournament.maxTeams) * 100);

  // Helper to format Date string
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="glass-panel border-[#00ff87]/15 p-5 flex flex-col justify-between hover:border-[#00ff87]/40 hover:shadow-[0_0_20px_rgba(0,255,135,0.1)] transition-all duration-300 transform hover:-translate-y-1 h-full relative overflow-hidden group">
      {/* Decorative neon gradient tag */}
      <div className="absolute top-0 right-0 h-1 w-24 bg-gradient-to-r from-[#00ff87] to-[#00d4ff]" />

      <div>
        {/* Status Badge & Header */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[9px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${
            tournament.status === 'upcoming' 
              ? 'bg-emerald-500/10 text-[#00ff87] border-[#00ff87]/20 animate-pulse'
              : tournament.status === 'ongoing'
              ? 'bg-sky-500/10 text-[#00d4ff] border-[#00d4ff]/20'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {tournament.status}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {tournament.registeredTeams.length}/{tournament.maxTeams} SQUADS
          </span>
        </div>

        {/* Tournament Name */}
        <h3 className="text-base font-display font-bold text-white group-hover:text-[#00ff87] transition-colors line-clamp-1 mb-2">
          {tournament.name}
        </h3>

        {/* Date Time info */}
        <p className="text-xs text-[#a0b4c8] flex items-center gap-1.5 mb-4">
          <Calendar className="w-3.5 h-3.5 text-[#00d4ff]" />
          <span>{formatDate(tournament.date)}</span>
        </p>

        {/* Metrics Box */}
        <div className="grid grid-cols-2 gap-3 bg-black/40 border border-white/5 rounded-lg p-2.5 mb-4">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Prize Pool</span>
            <span className="text-sm font-black font-mono text-[#00ff87] flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-[#00ff87]" />
              {tournament.prizePool}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Entry Fee</span>
            <span className="text-sm font-black font-mono text-[#00d4ff] flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-[#00d4ff]" />
              {tournament.entryFee}
            </span>
          </div>
        </div>

        {/* Slots progress bar */}
        <div className="space-y-1 mb-5">
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400 font-medium">Slots Filled</span>
            <span className="font-semibold text-white">{registeredCount} / {tournament.maxTeams} Teams</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-[#00ff87] to-[#00d4ff] rounded-full transition-all duration-500" 
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer action block */}
      <div className="flex gap-2 items-center mt-auto">
        {/* Detail Trigger */}
        <button
          onClick={() => onSelect(tournament.id)}
          className="flex-1 py-2 px-3 rounded-md bg-white/5 hover:bg-white/10 text-xs font-semibold text-white tracking-wide transition uppercase border border-white/10 flex items-center justify-center gap-1.5"
          id={`btn-tour-detail-${tournament.id}`}
        >
          <Swords className="w-3.5 h-3.5 text-[#00d4ff]" />
          <span>Details</span>
        </button>

        {/* Register Action */}
        {tournament.status === 'completed' ? (
          <button
            onClick={() => onSelect(tournament.id)}
            className="flex-1 py-2 px-3 rounded-md bg-slate-800 text-slate-400 text-xs font-semibold tracking-wide cursor-pointer hover:bg-slate-700/80 transition"
            id={`btn-tour-results-${tournament.id}`}
          >
            RESULTS
          </button>
        ) : isRegistered ? (
          <div className="flex-1 text-center py-2 px-3 rounded-md bg-emerald-500/10 border border-[#00ff87]/30 text-[#00ff87] text-[10px] font-bold uppercase tracking-wider font-display">
            ✓ REGISTERED
          </div>
        ) : isFull ? (
          <button 
            disabled 
            className="flex-1 py-2 px-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-widest cursor-not-allowed"
          >
            FULL
          </button>
        ) : (
          <button
            onClick={() => onRegister(tournament.id)}
            className="flex-1 btn-neon-green py-2 px-3 rounded-md text-xs tracking-wider"
            id={`btn-tour-register-${tournament.id}`}
          >
            REGISTER
          </button>
        )}
      </div>
    </div>
  );
};

export default TournamentCard;
