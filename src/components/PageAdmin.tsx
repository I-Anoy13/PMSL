import React, { useState, FormEvent } from 'react';
import { Shield, Plus, Calendar, Coins, Trophy, Users, Check, Clock, Edit3, Settings } from 'lucide-react';
import { Tournament, Team, MockDatabase } from '../lib/mockFirebase';

interface PageAdminProps {
  tournaments: Tournament[];
  teams: Team[];
  onCreateTournament: (tour: Tournament) => void;
  onUpdateTournamentStatus: (tourId: string, status: 'upcoming' | 'ongoing' | 'completed', results?: any) => void;
}

export default function PageAdmin({
  tournaments,
  teams,
  onCreateTournament,
  onUpdateTournamentStatus
}: PageAdminProps) {
  // New Tournament form states
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [entryFee, setEntryFee] = useState(50);
  const [prizePool, setPrizePool] = useState(500);
  const [maxTeams, setMaxTeams] = useState(16);
  const [description, setDescription] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Status updating states
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
  const [resultsWinner, setResultsWinner] = useState('');
  const [resultsRunnerUp, setResultsRunnerUp] = useState('');
  const [resultsThird, setResultsThird] = useState('');

  // Handle new tournament creation
  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');

    if (!name.trim() || !date || !description.trim()) {
      setFormError('Please fill out all fields.');
      return;
    }

    try {
      const created = MockDatabase.createTournament({
        name: name.trim(),
        description: description.trim(),
        date: new Date(date).toISOString(),
        entryFee: Number(entryFee),
        prizePool: Number(prizePool),
        maxTeams: Number(maxTeams),
        status: 'upcoming',
        results: { winner: null, runnerUp: null, third: null }
      });

      onCreateTournament(created);
      setFormSuccess('Tournament created successfully!');
      setName('');
      setDate('');
      setDescription('');
    } catch (err) {
      setFormError('Could not establish tournament.');
    }
  };

  // Handle status update
  const handleUpdateStatus = (tourId: string, status: 'upcoming' | 'ongoing' | 'completed') => {
    if (status === 'completed') {
      // Trigger results drawer
      setSelectedTourId(tourId);
    } else {
      onUpdateTournamentStatus(tourId, status);
    }
  };

  // Submit Completed Tournament Results
  const handleSaveResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTourId) {
      onUpdateTournamentStatus(selectedTourId, 'completed', {
        winner: resultsWinner || null,
        runnerUp: resultsRunnerUp || null,
        third: resultsThird || null
      });

      // Reset
      setSelectedTourId(null);
      setResultsWinner('');
      setResultsRunnerUp('');
      setResultsThird('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      {/* Admin Title */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <Shield className="w-6 h-6 text-rose-500" />
        <div>
          <h1 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-wider">
            Operational Administration Dashboard
          </h1>
          <p className="text-xs text-rose-400">Restricted to administrator emails only.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create Tournament Form (Col span 5) */}
        <div className="lg:col-span-5 glass-panel border-rose-500/20 p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Plus className="w-5 h-5 text-rose-400" />
            <h3 className="font-display font-bold text-xs uppercase tracking-widest text-white">
              Create New Custom League
            </h3>
          </div>

          <form onSubmit={handleCreateTournament} className="space-y-4">
            {formSuccess && (
              <div className="bg-[#00ff87]/10 border border-[#00ff87]/30 text-[#00ff87] p-3 rounded text-xs">
                {formSuccess}
              </div>
            )}
            {formError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded text-xs">
                {formError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tournament Name</label>
              <input
                type="text"
                placeholder="e.g. PMSL Erangel Grand Final"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Launch Date & Time</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Entry (Coins)</label>
                <input
                  type="number"
                  value={entryFee}
                  onChange={(e) => setEntryFee(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded px-2 py-2 text-xs text-white font-mono"
                  min={0}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prize (Coins)</label>
                <input
                  type="number"
                  value={prizePool}
                  onChange={(e) => setPrizePool(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded px-2 py-2 text-xs text-white font-mono"
                  min={0}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Max Squads</label>
                <input
                  type="number"
                  value={maxTeams}
                  onChange={(e) => setMaxTeams(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded px-2 py-2 text-xs text-white font-mono"
                  min={2}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
              <textarea
                placeholder="Details on map, stream channels, guidelines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white h-24 focus:outline-none focus:border-rose-500 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-widest rounded transition"
              id="btn-admin-create-tour"
            >
              Create Tournament
            </button>
          </form>
        </div>

        {/* Existing Tournaments Status Controller (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel border-white/5 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Settings className="w-5 h-5 text-rose-400" />
              <h3 className="font-display font-bold text-xs uppercase tracking-widest text-white">
                Active League Controller
              </h3>
            </div>

            <div className="space-y-4 divide-y divide-white/5">
              {tournaments.map((tour) => (
                <div key={tour.id} className="pt-4 first:pt-0 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">{tour.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Fee: {tour.entryFee} 🪙 | Prize: {tour.prizePool} 🪙 | Reg: {tour.registeredTeams.length}/{tour.maxTeams} Teams
                      </p>
                    </div>
                    <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                      tour.status === 'upcoming' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      tour.status === 'ongoing' ? 'bg-sky-500/10 text-[#00d4ff] border border-sky-500/20' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {tour.status}
                    </span>
                  </div>

                  {/* Registered squads listing */}
                  {tour.registeredTeams.length > 0 && (
                    <div className="bg-black/35 border border-white/5 rounded-lg p-2.5 space-y-1.5">
                      <span className="text-[8px] text-slate-500 uppercase font-mono block">Registered Squads:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {tour.registeredTeams.map((tid) => {
                          const squad = teams.find((t) => t.id === tid);
                          return (
                            <span key={tid} className="bg-slate-800/80 text-white text-[9px] px-2 py-0.5 rounded border border-white/5 font-mono">
                              {squad ? `${squad.logo} ${squad.name}` : `ID: ${tid}`}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Action states buttons */}
                  <div className="flex items-center gap-2">
                    {tour.status === 'upcoming' && (
                      <button
                        onClick={() => handleUpdateStatus(tour.id, 'ongoing')}
                        className="bg-sky-600 hover:bg-sky-500 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition"
                        id={`btn-status-ongoing-${tour.id}`}
                      >
                        Start Tournament (Ongoing)
                      </button>
                    )}
                    {tour.status !== 'completed' && (
                      <button
                        onClick={() => handleUpdateStatus(tour.id, 'completed')}
                        className="bg-yellow-600 hover:bg-yellow-500 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition"
                        id={`btn-status-complete-${tour.id}`}
                      >
                        Complete Tournament & Set Winner
                      </button>
                    )}
                    {tour.status === 'completed' && (
                      <div className="text-[10px] text-slate-500 italic">
                        Winner: <strong className="text-[#00ff87]">{tour.results?.winner || 'None'}</strong>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Winner Selection Drawer Overlay Modal */}
      {selectedTourId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel border-rose-500/30 p-6 max-w-sm w-full space-y-4">
            <h3 className="font-display font-black text-sm text-white uppercase tracking-wider text-center border-b border-white/5 pb-3">
              Set League Podium Finishers
            </h3>

            <form onSubmit={handleSaveResults} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">🥇 1st Place Team (Winner)</label>
                <select
                  value={resultsWinner}
                  onChange={(e) => setResultsWinner(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white"
                  required
                >
                  <option value="">Select Team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} [{t.tag}]</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">🥈 2nd Place Team</label>
                <select
                  value={resultsRunnerUp}
                  onChange={(e) => setResultsRunnerUp(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white"
                >
                  <option value="">Select Team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} [{t.tag}]</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">🥉 3rd Place Team</label>
                <select
                  value={resultsThird}
                  onChange={(e) => setResultsThird(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white"
                >
                  <option value="">Select Team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} [{t.tag}]</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase rounded transition"
                  id="btn-confirm-podium"
                >
                  Save Results
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTourId(null)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase rounded transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
