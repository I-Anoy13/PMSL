import React, { useState } from 'react';
import { 
  Shield, Plus, Calendar, Coins, Trophy, Users, Check, Clock, Edit3, Settings, 
  Trash2, Search, Save, ListOrdered, Upload, UserCheck, RefreshCw, ShieldAlert,
  ChevronRight, AlertCircle
} from 'lucide-react';
import { Tournament, Team, UserProfile, MockDatabase } from '../lib/mockFirebase';

interface PageAdminProps {
  tournaments: Tournament[];
  teams: Team[];
  allUsers: UserProfile[];
  onCreateTournament: (tour: Tournament) => void;
  onUpdateTournamentStatus: (tourId: string, status: 'upcoming' | 'ongoing' | 'completed', results?: any) => void;
  currentUser: UserProfile;
}

type AdminTab = 'leagues' | 'teams' | 'slots' | 'results' | 'monetization';

export default function PageAdmin({
  tournaments,
  teams,
  allUsers,
  onCreateTournament,
  onUpdateTournamentStatus,
  currentUser
}: PageAdminProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('leagues');

  // --- ADSTERRA MONETIZATION STATE ---
  const [resultsAdLink, setResultsAdLink] = useState('');
  const [slotsAdLink, setSlotsAdLink] = useState('');
  const [earnAdLink, setEarnAdLink] = useState('');
  const [loginAdLink, setLoginAdLink] = useState('');
  const [adsSuccess, setAdsSuccess] = useState('');

  React.useEffect(() => {
    const config = MockDatabase.getAdsConfig();
    setResultsAdLink(config.resultsAdLink);
    setSlotsAdLink(config.slotsAdLink);
    setEarnAdLink(config.earnAdLink);
    setLoginAdLink(config.loginAdLink);
  }, []);

  const handleSaveAds = (e: React.FormEvent) => {
    e.preventDefault();
    setAdsSuccess('');
    MockDatabase.saveAdsConfig({
      id: 'ads_config',
      resultsAdLink: resultsAdLink.trim(),
      slotsAdLink: slotsAdLink.trim(),
      earnAdLink: earnAdLink.trim(),
      loginAdLink: loginAdLink.trim(),
    });
    setAdsSuccess('Adsterra links successfully updated!');
    setTimeout(() => setAdsSuccess(''), 4000);
  };

  const handleToggleAdminRole = (uid: string) => {
    const isOwner = currentUser?.email === 'anoypak3@gmail.com' || currentUser?.role === 'owner';
    if (!isOwner) return;

    const userProfile = allUsers.find(u => u.uid === uid);
    if (userProfile) {
      if (userProfile.email === 'anoypak3@gmail.com') return; // Cannot demote Owner
      const updated = { ...userProfile };
      updated.role = updated.role === 'admin' ? 'user' : 'admin';
      MockDatabase.saveUser(updated);
    }
  };

  // --- LEAGUES TAB STATE ---
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

  // --- TEAMS & USERS STATE ---
  const [teamSearch, setTeamSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamTag, setEditTeamTag] = useState('');
  const [editTeamLogo, setEditTeamLogo] = useState('');
  const [editTeamWins, setEditTeamWins] = useState(0);

  // User adjustment state
  const [adjustingUserUid, setAdjustingUserUid] = useState<string | null>(null);
  const [coinAdjustmentAmount, setCoinAdjustmentAmount] = useState<number>(100);

  // --- SLOTS CONFIGURATION STATE ---
  const [slotTourId, setSlotTourId] = useState('');
  const [slotsConfig, setSlotsConfig] = useState<Record<string, string>>({}); // slotNumber -> teamId

  // --- MATCH RESULTS STATE ---
  const [resultTourId, setResultTourId] = useState('');
  const [matchNumber, setMatchNumber] = useState(1);
  const [matchMap, setMatchMap] = useState('Erangel (TPP)');
  // List of rankings being entered: teamId -> { placement: number, kills: number }
  const [matchRankings, setMatchRankings] = useState<Record<string, { placement: number; kills: number }>>({});

  // --- UTILS ---
  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || 'Unknown Team';
  };

  const getTeamTag = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.tag || 'UNK';
  };

  const getUserName = (uid: string) => {
    return allUsers.find(u => u.uid === uid)?.name || 'Unknown Player';
  };

  // --- HANDLERS: LEAGUES ---
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

  const handleDeleteTournament = (tourId: string) => {
    if (window.confirm('Are you sure you want to delete this tournament? This will remove all associated slots and statistics.')) {
      MockDatabase.deleteTournament(tourId);
    }
  };

  const handleUpdateStatus = (tourId: string, status: 'upcoming' | 'ongoing' | 'completed') => {
    if (status === 'completed') {
      setSelectedTourId(tourId);
      const tour = tournaments.find(t => t.id === tourId);
      if (tour && tour.registeredTeams.length > 0) {
        setResultsWinner(tour.registeredTeams[0] || '');
        setResultsRunnerUp(tour.registeredTeams[1] || '');
        setResultsThird(tour.registeredTeams[2] || '');
      }
    } else {
      onUpdateTournamentStatus(tourId, status);
    }
  };

  const handleSavePodiumResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTourId) {
      onUpdateTournamentStatus(selectedTourId, 'completed', {
        winner: resultsWinner || null,
        runnerUp: resultsRunnerUp || null,
        third: resultsThird || null
      });
      setSelectedTourId(null);
    }
  };

  // --- HANDLERS: TEAMS & USERS ---
  const handleDeleteTeam = (teamId: string) => {
    if (window.confirm('Are you sure you want to disband and delete this squad? All members will be unlinked.')) {
      MockDatabase.deleteTeam(teamId);
    }
  };

  const handleStartEditTeam = (team: Team) => {
    setEditingTeamId(team.id);
    setEditTeamName(team.name);
    setEditTeamTag(team.tag);
    setEditTeamLogo(team.logo);
    setEditTeamWins(team.totalWins || 0);
  };

  const handleSaveTeamEdit = () => {
    if (editingTeamId) {
      const allTeams = MockDatabase.getCollection<Team>('teams');
      const idx = allTeams.findIndex(t => t.id === editingTeamId);
      if (idx >= 0) {
        allTeams[idx] = {
          ...allTeams[idx],
          name: editTeamName.trim(),
          tag: editTeamTag.trim().toUpperCase(),
          logo: editTeamLogo,
          totalWins: Number(editTeamWins)
        };
        MockDatabase.setCollection('teams', allTeams);
      }
      setEditingTeamId(null);
    }
  };

  const handleAdjustUserCoins = (uid: string, add: boolean) => {
    const userProfile = allUsers.find(u => u.uid === uid);
    if (userProfile) {
      const updated = { ...userProfile };
      const delta = add ? coinAdjustmentAmount : -coinAdjustmentAmount;
      updated.coins = Math.max(0, updated.coins + delta);
      MockDatabase.saveUser(updated);

      // Create log transaction
      MockDatabase.addTransaction({
        userId: uid,
        amount: Math.abs(delta),
        type: delta > 0 ? 'earned' : 'spent',
        source: 'daily_bonus',
        description: `Admin adjustment: ${delta > 0 ? '+' : '-'}${Math.abs(delta)} coins`
      });

      setAdjustingUserUid(null);
    }
  };

  // --- HANDLERS: SLOTS ---
  const handleSelectSlotTournament = (tourId: string) => {
    setSlotTourId(tourId);
    const tour = tournaments.find(t => t.id === tourId);
    if (tour) {
      setSlotsConfig(tour.slots || {});
    } else {
      setSlotsConfig({});
    }
  };

  const handleAssignSlot = (slotNum: string, teamId: string) => {
    setSlotsConfig(prev => ({
      ...prev,
      [slotNum]: teamId
    }));
  };

  const handleSaveSlots = () => {
    const tour = tournaments.find(t => t.id === slotTourId);
    if (tour) {
      const updated = {
        ...tour,
        slots: slotsConfig
      };
      MockDatabase.saveTournament(updated);
      alert('Slots configuration updated and saved successfully!');
    }
  };

  // --- HANDLERS: MATCH RESULTS ---
  const handleSelectResultTournament = (tourId: string) => {
    setResultTourId(tourId);
    const tour = tournaments.find(t => t.id === tourId);
    if (tour) {
      // Set default rankings with registered teams
      const rankings: Record<string, { placement: number; kills: number }> = {};
      tour.registeredTeams.forEach((tid, index) => {
        rankings[tid] = { placement: index + 1, kills: 0 };
      });
      setMatchRankings(rankings);
    } else {
      setMatchRankings({});
    }
  };

  const handleUpdateRankings = (teamId: string, field: 'placement' | 'kills', value: number) => {
    setMatchRankings(prev => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        [field]: value
      }
    }));
  };

  // Auto-calculate PUBG points placement logic
  const getPubgPlacementPoints = (placement: number) => {
    if (placement === 1) return 10;
    if (placement === 2) return 6;
    if (placement === 3) return 5;
    if (placement === 4) return 4;
    if (placement === 5) return 3;
    if (placement === 6) return 2;
    if (placement === 7 || placement === 8) return 1;
    return 0;
  };

  const handleSaveMatchResults = () => {
    const tour = tournaments.find(t => t.id === resultTourId);
    if (!tour) return;

    // Build the matches data structure
    const rankingsArray = Object.entries(matchRankings).map(([teamId, data]) => {
      const typedData = data as { placement: number; kills: number };
      const placementPoints = getPubgPlacementPoints(typedData.placement);
      const killPoints = typedData.kills;
      return {
        teamId,
        placement: typedData.placement,
        kills: typedData.kills,
        totalPoints: placementPoints + killPoints
      };
    });

    const currentMatches = tour.matchResults || [];
    const newMatch = {
      matchNumber,
      map: matchMap,
      rankings: rankingsArray
    };

    // Replace or add match results
    const existingIndex = currentMatches.findIndex(m => m.matchNumber === matchNumber);
    const updatedMatches = [...currentMatches];
    if (existingIndex >= 0) {
      updatedMatches[existingIndex] = newMatch;
    } else {
      updatedMatches.push(newMatch);
    }

    const updatedTour = {
      ...tour,
      matchResults: updatedMatches
    };

    MockDatabase.saveTournament(updatedTour);
    alert(`Match ${matchNumber} results uploaded and synced successfully!`);
  };

  // Filtered queries
  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(teamSearch.toLowerCase()) || 
    t.tag.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      {/* Admin Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-wider">
              Control Panel & Administration
            </h1>
            <p className="text-xs text-rose-400 font-mono">ROLE: SYSTEM_SUPERUSER | ACTIVE PROFILE</p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
          {((currentUser?.email === 'anoypak3@gmail.com' || currentUser?.role === 'owner')
            ? ['leagues', 'teams', 'slots', 'results', 'monetization'] as const
            : ['leagues', 'teams', 'slots', 'results'] as const
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[10px] uppercase tracking-wider font-bold font-display px-3 py-2 rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'leagues' && 'Leagues & Form'}
              {tab === 'teams' && 'Teams & Users'}
              {tab === 'slots' && 'Slot Boards'}
              {tab === 'results' && 'Match Standings'}
              {tab === 'monetization' && 'Adsterra Monetization'}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: LEAGUES MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'leagues' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          {/* Create form (span 5) */}
          <div className="lg:col-span-5 glass-panel border-rose-500/20 p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Plus className="w-5 h-5 text-rose-400" />
              <h3 className="font-display font-bold text-xs uppercase tracking-widest text-white">
                Launch Custom League
              </h3>
            </div>

            <form onSubmit={handleCreateTournament} className="space-y-4">
              {formSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}
              {formError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tournament Name</label>
                <input
                  type="text"
                  placeholder="e.g. PMSL Erangel Showdown"
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
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Max Teams</label>
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
                  placeholder="Map choices, streaming coordinates, guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white h-24 focus:outline-none focus:border-rose-500 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition font-display"
              >
                Create Tournament
              </button>
            </form>
          </div>

          {/* Controller List (span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel border-white/5 p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Settings className="w-5 h-5 text-rose-400" />
                <h3 className="font-display font-bold text-xs uppercase tracking-widest text-white">
                  Active League Controller ({tournaments.length})
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
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                          tour.status === 'upcoming' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          tour.status === 'ongoing' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {tour.status}
                        </span>

                        <button 
                          onClick={() => handleDeleteTournament(tour.id)}
                          className="p-1 hover:bg-rose-500/10 hover:text-rose-400 text-slate-500 rounded transition"
                          title="Delete tournament"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Registered Squads List */}
                    {tour.registeredTeams.length > 0 && (
                      <div className="bg-black/35 border border-white/5 rounded-lg p-2.5 space-y-1.5">
                        <span className="text-[8px] text-slate-500 uppercase font-mono block">Registered squads:</span>
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

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {tour.status === 'upcoming' && (
                        <button
                          onClick={() => handleUpdateStatus(tour.id, 'ongoing')}
                          className="bg-sky-600/80 hover:bg-sky-600 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition font-mono"
                        >
                          Start Match (Ongoing)
                        </button>
                      )}
                      {tour.status !== 'completed' && (
                        <button
                          onClick={() => handleUpdateStatus(tour.id, 'completed')}
                          className="bg-amber-600/80 hover:bg-amber-600 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition font-mono"
                        >
                          Complete Tournament (Podium)
                        </button>
                      )}
                      {tour.status === 'completed' && (
                        <div className="text-[10px] text-slate-500 italic">
                          Winner: <strong className="text-[#00ff87]">{getTeamName(tour.results?.winner || '')}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: TEAMS & USERS MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'teams' && (
        <div className="space-y-8 animate-fade-in">
          {/* Teams list */}
          <div className="glass-panel border-white/5 p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-400" />
                <h3 className="font-display font-bold text-xs uppercase tracking-widest text-white">
                  Squad Registry Records ({teams.length})
                </h3>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Squads/Tags..."
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  className="bg-black/40 border border-white/5 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 w-60"
                />
              </div>
            </div>

            {/* Teams Grid Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-white/5">
                <thead>
                  <tr className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                    <th className="py-3 px-2">Squad Logo/Name</th>
                    <th className="py-3 px-2">Tag</th>
                    <th className="py-3 px-2">Captain</th>
                    <th className="py-3 px-2">Members count</th>
                    <th className="py-3 px-2 font-mono">Wins / Matches</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTeams.map((team) => (
                    <tr key={team.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-2 font-bold text-white flex items-center gap-2">
                        <span>{team.logo}</span>
                        <span>{team.name}</span>
                      </td>
                      <td className="py-3 px-2 font-mono text-rose-400">[{team.tag}]</td>
                      <td className="py-3 px-2 text-slate-300">{getUserName(team.captainId)}</td>
                      <td className="py-3 px-2 text-slate-300 font-mono">{team.members.length} / 5</td>
                      <td className="py-3 px-2 text-slate-300 font-mono">{team.totalWins} wins / {team.totalMatches} matches</td>
                      <td className="py-3 px-2 text-right space-x-1">
                        <button
                          onClick={() => handleStartEditTeam(team)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded text-[10px] font-bold uppercase"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="bg-rose-950/40 hover:bg-rose-900 border border-rose-900/30 text-rose-400 px-2 py-1 rounded text-[10px] font-bold uppercase"
                        >
                          Disband
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User profiles database */}
          <div className="glass-panel border-white/5 p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-rose-400" />
                <h3 className="font-display font-bold text-xs uppercase tracking-widest text-white">
                  Player Accounts Directory ({allUsers.length})
                </h3>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="bg-black/40 border border-white/5 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 w-60"
                />
              </div>
            </div>

            {/* Users grid table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-white/5">
                <thead>
                  <tr className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                    <th className="py-3 px-2">Player name / IGN</th>
                    <th className="py-3 px-2">Email</th>
                    <th className="py-3 px-2">Squad status</th>
                    <th className="py-3 px-2 font-mono">Coins (Wallet)</th>
                    <th className="py-3 px-2">Badge level</th>
                    <th className="py-3 px-2">Role</th>
                    {currentUser?.email === 'anoypak3@gmail.com' && (
                      <th className="py-3 px-2 text-center">Manage Admin</th>
                    )}
                    <th className="py-3 px-2 text-right">Balance adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((p) => (
                    <tr key={p.uid} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-2 flex items-center gap-2">
                        <img src={p.photoURL} className="w-8 h-8 rounded-full border border-white/15" referrerPolicy="no-referrer" />
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{p.name}</span>
                          <span className="text-[10px] text-slate-400">Name: {p.fullName || 'Not Set'}</span>
                          <span className="text-[10px] text-[#00ff87] font-mono">IGN: {p.gameName || 'Not Set'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-slate-400 font-mono">{p.email}</td>
                      <td className="py-3 px-2">
                        {p.teamId ? (
                          <span className="text-[10px] bg-slate-800 text-[#00ff87] px-2 py-0.5 rounded font-mono font-bold">
                            [{getTeamTag(p.teamId)}] {getTeamName(p.teamId)}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">No squad</span>
                        )}
                      </td>
                      <td className="py-3 px-2 font-mono text-[#00ff87] font-bold">🪙 {p.coins}</td>
                      <td className="py-3 px-2">
                        <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-black/40 border border-white/5">
                          {p.level}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                          p.role === 'owner' || p.email === 'anoypak3@gmail.com'
                            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                            : p.role === 'admin'
                            ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                            : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                        }`}>
                          {p.role === 'owner' || p.email === 'anoypak3@gmail.com' ? 'Owner' : p.role === 'admin' ? 'Admin' : 'Player'}
                        </span>
                      </td>
                      {currentUser?.email === 'anoypak3@gmail.com' && (
                        <td className="py-3 px-2 text-center">
                          {p.email !== 'anoypak3@gmail.com' && p.role !== 'owner' ? (
                            <button
                              onClick={() => handleToggleAdminRole(p.uid)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                p.role === 'admin'
                                  ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 border border-rose-900/30'
                                  : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-900/30'
                              }`}
                            >
                              {p.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                            </button>
                          ) : (
                            <span className="text-slate-500 italic text-[10px]">Superuser</span>
                          )}
                        </td>
                      )}
                      <td className="py-3 px-2 text-right">
                        {adjustingUserUid === p.uid ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <input
                              type="number"
                              value={coinAdjustmentAmount}
                              onChange={(e) => setCoinAdjustmentAmount(Number(e.target.value))}
                              className="bg-black border border-white/20 rounded w-16 px-1.5 py-0.5 font-mono text-xs text-white"
                            />
                            <button
                              onClick={() => handleAdjustUserCoins(p.uid, true)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-bold"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => handleAdjustUserCoins(p.uid, false)}
                              className="bg-rose-600 hover:bg-rose-500 text-white px-2 py-0.5 rounded text-[10px] font-bold"
                            >
                              Sub
                            </button>
                            <button
                              onClick={() => setAdjustingUserUid(null)}
                              className="text-slate-500 hover:text-slate-300 text-[10px] underline ml-1"
                            >
                              Exit
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAdjustingUserUid(p.uid);
                              setCoinAdjustmentAmount(100);
                            }}
                            className="text-[10px] text-rose-400 font-mono uppercase underline hover:text-rose-300"
                          >
                            Modify wallet
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SLOT LISTS CONFIGURATION */}
      {/* ========================================================= */}
      {activeTab === 'slots' && (
        <div className="glass-panel border-white/5 p-6 space-y-6 animate-fade-in">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <ListOrdered className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="font-display font-bold text-xs uppercase tracking-widest text-white">
                Championship Squad Slots assigner
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Assign teams to slot numbers (1-20) for live scoreboard rendering.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="max-w-md space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select League / Tournament</label>
              <select
                value={slotTourId}
                onChange={(e) => handleSelectSlotTournament(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">-- Choose Active or Upcoming Tournament --</option>
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>{t.name} [{t.status.toUpperCase()}]</option>
                ))}
              </select>
            </div>

            {slotTourId ? (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 17 }, (_, i) => i + 4).map((slotNum) => {
                    const stringSlot = slotNum.toString();
                    const activeAssignedTeamId = slotsConfig[stringSlot] || '';

                    return (
                      <div key={slotNum} className="bg-black/35 border border-white/5 rounded-xl p-3 space-y-1.5 flex flex-col justify-between">
                        <span className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest">
                          SLOT {slotNum}
                        </span>
                        
                        <select
                          value={activeAssignedTeamId}
                          onChange={(e) => handleAssignSlot(stringSlot, e.target.value)}
                          className="bg-black border border-white/10 rounded px-2 py-1 text-[11px] text-white w-full"
                        >
                          <option value="">-- Empty Slot --</option>
                          {teams.map(t => (
                            <option key={t.id} value={t.id}>{t.logo} {t.name} [{t.tag}]</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end border-t border-white/5 pt-4">
                  <button
                    onClick={handleSaveSlots}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Slot configuration</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-10 bg-black/20 border border-white/5 rounded-xl">
                <p className="text-xs text-slate-400 italic">Please select a tournament to configure its team slots.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: RESULTS STANDINGS UPLOADS */}
      {/* ========================================================= */}
      {activeTab === 'results' && (
        <div className="glass-panel border-white/5 p-6 space-y-6 animate-fade-in">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Upload className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="font-display font-bold text-xs uppercase tracking-widest text-white">
                Match Results & Standings uploader
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Enter placement rankings and kills for individual lobbies to update overall standings.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Tournament</label>
                <select
                  value={resultTourId}
                  onChange={(e) => handleSelectResultTournament(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="">-- Select Active League --</option>
                  {tournaments.map(t => (
                    <option key={t.id} value={t.id}>{t.name} [{t.status.toUpperCase()}]</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match Number</label>
                <select
                  value={matchNumber}
                  onChange={(e) => setMatchNumber(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>Match #{num}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Map & Mode</label>
                <select
                  value={matchMap}
                  onChange={(e) => setMatchMap(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                >
                  <option value="Erangel (TPP)">Erangel (TPP)</option>
                  <option value="Miramar (TPP)">Miramar (TPP)</option>
                  <option value="Sanhok (TPP)">Sanhok (TPP)</option>
                  <option value="Vikendi (TPP)">Vikendi (TPP)</option>
                </select>
              </div>
            </div>

            {resultTourId ? (
              <div className="space-y-4">
                <div className="bg-[#0a0e17] border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 mb-4 bg-amber-500/10 p-3 rounded-lg">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Placements are 1-indexed. Points will auto-calculate based on PUBG standard (1st = 10, 2nd = 6, 3rd = 5, 4th = 4, 5th = 3, 6th = 2, 7th-8th = 1, others = 0) + 1 point per kill.</span>
                  </div>

                  <div className="space-y-3">
                    {/* List enrolled teams */}
                    {tournaments.find(t => t.id === resultTourId)?.registeredTeams.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No teams are enrolled in this tournament yet.</p>
                    ) : (
                      tournaments.find(t => t.id === resultTourId)?.registeredTeams.map((tid) => {
                        const data = matchRankings[tid] || { placement: 1, kills: 0 };
                        return (
                          <div key={tid} className="bg-black/35 border border-white/5 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{teams.find(t => t.id === tid)?.logo || '🛡️'}</span>
                              <span className="font-bold text-white text-xs">{getTeamName(tid)}</span>
                              <span className="text-[10px] text-slate-500 font-mono">[{getTeamTag(tid)}]</span>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Rank placement:</span>
                                <input
                                  type="number"
                                  min={1}
                                  max={20}
                                  value={data.placement}
                                  onChange={(e) => handleUpdateRankings(tid, 'placement', Number(e.target.value))}
                                  className="bg-black border border-white/10 rounded w-16 px-2 py-1 text-xs text-white text-center font-mono"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Kills count:</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={data.kills}
                                  onChange={(e) => handleUpdateRankings(tid, 'kills', Number(e.target.value))}
                                  className="bg-black border border-white/10 rounded w-16 px-2 py-1 text-xs text-white text-center font-mono"
                                />
                              </div>

                              <div className="text-right font-mono min-w-[70px]">
                                <span className="text-[9px] text-slate-500 block">Total points:</span>
                                <span className="text-xs font-black text-[#00ff87]">
                                  {getPubgPlacementPoints(data.placement) + data.kills} pts
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="flex justify-end border-t border-white/5 pt-4">
                  <button
                    onClick={handleSaveMatchResults}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Upload match results</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-10 bg-black/20 border border-white/5 rounded-xl">
                <p className="text-xs text-slate-400 italic">Please select a tournament to enter and upload results.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team Details Editing Modal */}
      {editingTeamId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel border-rose-500/30 p-6 max-w-sm w-full space-y-4 rounded-2xl">
            <h3 className="font-display font-black text-sm text-white uppercase tracking-wider text-center border-b border-white/5 pb-3">
              Modify Squad Records
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Squad Name</label>
                <input
                  type="text"
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Team Tag</label>
                  <input
                    type="text"
                    value={editTeamTag}
                    onChange={(e) => setEditTeamTag(e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                    maxLength={4}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Squad Logo Emoji</label>
                  <input
                    type="text"
                    value={editTeamLogo}
                    onChange={(e) => setEditTeamLogo(e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white text-center focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Total Wins</label>
                <input
                  type="number"
                  value={editTeamWins}
                  onChange={(e) => setEditTeamWins(Number(e.target.value))}
                  className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                  min={0}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveTeamEdit}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase rounded-xl transition font-display"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingTeamId(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase rounded-xl transition font-display"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Podiums Modal */}
      {selectedTourId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel border-rose-500/30 p-6 max-w-sm w-full space-y-4 rounded-2xl">
            <h3 className="font-display font-black text-sm text-white uppercase tracking-wider text-center border-b border-white/5 pb-3">
              Set Championship Podium
            </h3>

            <form onSubmit={handleSavePodiumResults} className="space-y-4">
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
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase rounded-xl transition"
                >
                  Save Results
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTourId(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: ADSTERRA MONETIZATION CONFIG */}
      {/* ========================================================= */}
      {activeTab === 'monetization' && (
        <div className="glass-panel border-white/5 p-6 space-y-6 animate-fade-in">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Settings className="w-5 h-5 text-rose-400" />
            <h3 className="font-display font-bold text-xs uppercase tracking-widest text-white">
              Adsterra Monetization Links
            </h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            As the Owner, you can specify your Adsterra direct links or banner URLs below. 
            When players view the tournament results, register for slots, or earn coins, 
            the application will route through these links so you earn revenue from traffic.
          </p>

          {adsSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{adsSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveAds} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-300 block">
                  Earn Coins (Watch Ads Link)
                </label>
                <input
                  type="url"
                  required
                  value={earnAdLink}
                  onChange={(e) => setEarnAdLink(e.target.value)}
                  placeholder="https://www.highperformancecpmgate.com/..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
                <p className="text-[10px] text-slate-500">
                  Direct ad redirect triggered when players watch an ad to earn +50 coins.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-300 block">
                  Viewing Results (Ad Gate Link)
                </label>
                <input
                  type="url"
                  required
                  value={resultsAdLink}
                  onChange={(e) => setResultsAdLink(e.target.value)}
                  placeholder="https://www.highperformancecpmgate.com/..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
                <p className="text-[10px] text-slate-500">
                  Ad link opened in a new tab when a player clicks "Unlock Lobbies / Results".
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-300 block">
                  Viewing Slot List (Slot Ad Link)
                </label>
                <input
                  type="url"
                  required
                  value={slotsAdLink}
                  onChange={(e) => setSlotsAdLink(e.target.value)}
                  placeholder="https://www.highperformancecpmgate.com/..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
                <p className="text-[10px] text-slate-500">
                  Ad link opened in a new tab when players view tournament slot lists.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-300 block">
                  Successful Login Ad Link
                </label>
                <input
                  type="url"
                  required
                  value={loginAdLink}
                  onChange={(e) => setLoginAdLink(e.target.value)}
                  placeholder="https://www.highperformancecpmgate.com/..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
                <p className="text-[10px] text-slate-500">
                  Adsterra popunder/link opened automatically right after player logins.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition shadow-[0_0_15px_rgba(225,29,72,0.2)]"
            >
              Update Adsterra Links
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
