import React, { useState, FormEvent } from 'react';
import { Users, Shield, Copy, UserPlus, Plus, Sparkles, LogOut, ArrowLeft, Trash2, Check, User } from 'lucide-react';
import { UserProfile, Team, MockDatabase } from '../lib/mockFirebase';

interface PageTeamsProps {
  user: UserProfile;
  team: Team | null;
  allUsers: UserProfile[];
  onTeamCreated: (team: Team) => void;
  onTeamJoined: (team: Team) => void;
  onTeamLeft: () => void;
  onCopyCode: (code: string) => void;
}

const LOGO_OPTIONS = ['🛡️', '🐺', '⚡', '🐍', '🔥', '👑', '🎯', '👽', '💀', '🤖', '🦅', '🦁'];

export default function PageTeams({
  user,
  team,
  allUsers,
  onTeamCreated,
  onTeamJoined,
  onTeamLeft,
  onCopyCode
}: PageTeamsProps) {
  // Navigation states within Teams page
  const [activeTab, setActiveTab] = useState<'view' | 'create' | 'join'>(team ? 'view' : 'create');

  // Create Team Form State
  const [teamName, setTeamName] = useState('');
  const [teamTag, setTeamTag] = useState('');
  const [teamLogo, setTeamLogo] = useState('🛡️');
  const [formError, setFormError] = useState('');

  // Join Team Form State
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  // Leave Confirm state
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Kick Member state
  const [confirmKickUid, setConfirmKickUid] = useState<string | null>(null);

  const handleKickMember = (memberUid: string) => {
    if (!team) return;
    MockDatabase.kickMember(team.id, memberUid);
    setConfirmKickUid(null);
  };

  // Handle team creation
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!teamName.trim()) {
      setFormError('Team name is required.');
      return;
    }
    if (!teamTag.trim() || teamTag.length < 3 || teamTag.length > 4) {
      setFormError('Team tag must be 3-4 letters.');
      return;
    }

    try {
      const created = MockDatabase.createTeam(
        teamName.trim(),
        teamTag.toUpperCase().trim(),
        user.uid,
        teamLogo
      );
      
      onTeamCreated(created);
      setActiveTab('view');
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong.');
    }
  };

  // Handle team join
  const handleJoinTeam = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');

    if (!joinCode.trim()) {
      setJoinError('Please enter a team invite code.');
      return;
    }

    const result = MockDatabase.joinTeam(joinCode.trim().toUpperCase(), user.uid);
    if (typeof result === 'string') {
      setJoinError(result);
    } else {
      onTeamJoined(result);
      setActiveTab('view');
    }
  };

  // Handle team leave
  const handleLeaveTeam = () => {
    if (team) {
      MockDatabase.leaveTeam(team.id, user.uid);
      onTeamLeft();
      setShowLeaveConfirm(false);
      setActiveTab('create');
    }
  };

  // Map member UIDs to actual user profiles
  const getMemberProfiles = () => {
    if (!team) return [];
    return team.members.map(uid => {
      // Find user from seeded list, or fall back to simulated profile
      const found = allUsers.find(u => u.uid === uid);
      if (found) return found;
      // Mock profile if teammate is a seeded player
      return {
        uid,
        name: uid === 'captain-1' ? 'Pro_Pubg_Cap' : uid === 'player-2' ? 'Erangel_King' : uid === 'player-3' ? 'Snake_In_Grass' : uid === 'player-4' ? 'Sanhok_God' : 'Esports_Teammate',
        photoURL: '',
        level: 'Silver',
      };
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Tab Switcher Headers if NOT in a team */}
      {!team && (
        <div className="flex border-b border-white/5 pb-1">
          <button
            onClick={() => { setActiveTab('create'); setFormError(''); }}
            className={`flex items-center gap-2 px-6 py-3 font-display font-black text-xs uppercase tracking-widest border-b-2 transition ${
              activeTab === 'create' 
                ? 'border-[#00ff87] text-[#00ff87]' 
                : 'border-transparent text-[#a0b4c8] hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Create Esports Team</span>
          </button>
          <button
            onClick={() => { setActiveTab('join'); setJoinError(''); }}
            className={`flex items-center gap-2 px-6 py-3 font-display font-black text-xs uppercase tracking-widest border-b-2 transition ${
              activeTab === 'join' 
                ? 'border-[#00d4ff] text-[#00d4ff]' 
                : 'border-transparent text-[#a0b4c8] hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Join with Code</span>
          </button>
        </div>
      )}

      {/* RENDER VIEW C: VIEW ACTIVE TEAM */}
      {team && activeTab === 'view' && (
        <div className="space-y-6">
          <div className="glass-panel border-[#00ff87]/20 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-1.5 w-full bg-gradient-to-r from-[#00ff87] to-[#00d4ff]" />

            {/* Team Header Visuals */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-950 via-slate-900 to-black border-2 border-[#00ff87]/30 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-[#00ff87]/5">
                  {team.logo || '🛡️'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-display font-black text-white uppercase tracking-wider">{team.name}</h1>
                    <span className="bg-[#00ff87]/15 text-[#00ff87] border border-[#00ff87]/20 text-xs font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                      {team.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[#a0b4c8] mt-1">Established: {new Date(team.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Copy Invite Code block */}
              <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col items-start gap-1">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Share Team Invite Code</span>
                <button
                  onClick={() => onCopyCode(team.inviteCode)}
                  className="flex items-center gap-2 bg-black/60 hover:bg-black/90 border border-[#00ff87]/30 hover:border-[#00ff87] px-4 py-2 rounded font-mono text-white text-sm transition"
                  id="btn-copy-team-page"
                >
                  <span className="font-bold">{team.inviteCode}</span>
                  <Copy className="w-4 h-4 text-[#00ff87]" />
                </button>
              </div>
            </div>

            {/* Teammates List */}
            <div className="pt-6 space-y-4">
              <h3 className="font-display font-bold text-xs uppercase tracking-widest text-slate-400">
                Squad Members ({team.members.length}/5)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getMemberProfiles().map((member, idx) => {
                  const isCaptain = member.uid === team.captainId;
                  return (
                    <div 
                      key={member.uid || idx} 
                      className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 overflow-hidden">
                          {member.photoURL ? (
                            <img src={member.photoURL} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <User className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{member.name}</span>
                            {isCaptain && (
                              <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[8px] font-mono uppercase tracking-widest px-1 py-0.2 rounded">
                                CAPTAIN
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-500 font-mono">UID: {member.uid}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#00d4ff] font-bold uppercase font-mono mr-1">
                          {member.level || 'Silver'}
                        </span>
                        
                        {/* Kick Button if user is captain and member is not captain */}
                        {user.uid === team.captainId && member.uid !== team.captainId && (
                          <div className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-2">
                            {confirmKickUid === member.uid ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleKickMember(member.uid)}
                                  className="p-1 px-2 bg-rose-600 hover:bg-rose-500 text-white rounded text-[9px] font-bold uppercase tracking-wider transition"
                                  id={`btn-confirm-kick-${member.uid}`}
                                >
                                  Kick
                                </button>
                                <button
                                  onClick={() => setConfirmKickUid(null)}
                                  className="p-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-bold uppercase tracking-wider transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmKickUid(member.uid)}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded transition"
                                title="Remove member"
                                id={`btn-kick-${member.uid}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leave Team Section */}
            <div className="border-t border-white/5 mt-8 pt-6 flex justify-end">
              {!showLeaveConfirm ? (
                <button
                  onClick={() => setShowLeaveConfirm(true)}
                  className="px-4 py-2 border border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-400 text-xs font-bold tracking-wider rounded uppercase transition"
                  id="btn-trigger-leave"
                >
                  Leave Squad
                </button>
              ) : (
                <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg">
                  <span className="text-xs text-rose-200">Are you absolutely sure you want to leave?</span>
                  <button
                    onClick={handleLeaveTeam}
                    className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-3 py-1.5 rounded font-bold uppercase transition"
                    id="btn-confirm-leave"
                  >
                    Yes, Leave
                  </button>
                  <button
                    onClick={() => setShowLeaveConfirm(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded font-bold uppercase transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW A: CREATE TEAM */}
      {!team && activeTab === 'create' && (
        <div className="glass-panel border-[#00ff87]/15 p-6 max-w-xl mx-auto space-y-6">
          <div className="space-y-1">
            <h2 className="font-display font-black text-lg text-white uppercase tracking-wider">
              Create Esports Squad
            </h2>
            <p className="text-xs text-[#a0b4c8]">Establish a unique name and tag for custom match entries.</p>
          </div>

          <form onSubmit={handleCreateTeam} className="space-y-4">
            {formError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded text-xs">
                {formError}
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Team Name *</label>
              <input
                type="text"
                placeholder="e.g. Miramar Predators"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00ff87]"
                required
              />
            </div>

            {/* Tag Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Team Tag (3-4 Letters) *</label>
              <input
                type="text"
                placeholder="e.g. MPR"
                maxLength={4}
                value={teamTag}
                onChange={(e) => setTeamTag(e.target.value.toUpperCase())}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#00ff87]"
                required
              />
            </div>

            {/* Logo Emoji Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Squad Emblem</label>
              <div className="grid grid-cols-6 gap-2">
                {LOGO_OPTIONS.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => setTeamLogo(logo)}
                    className={`w-full aspect-square text-2xl flex items-center justify-center rounded-lg border transition ${
                      teamLogo === logo 
                        ? 'bg-[#00ff87]/15 border-[#00ff87] text-white scale-105' 
                        : 'bg-black/30 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full btn-neon-green py-3 text-xs tracking-wider"
                id="btn-submit-create-team"
              >
                Create Team
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RENDER VIEW B: JOIN TEAM */}
      {!team && activeTab === 'join' && (
        <div className="glass-panel border-[#00d4ff]/15 p-6 max-w-xl mx-auto space-y-6">
          <div className="space-y-1">
            <h2 className="font-display font-black text-lg text-white uppercase tracking-wider">
              Join Existing Squad
            </h2>
            <p className="text-xs text-[#a0b4c8]">Enter your squad captain's unique invite code (TEAM-XXXX format).</p>
          </div>

          <form onSubmit={handleJoinTeam} className="space-y-4">
            {joinError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded text-xs">
                {joinError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Team Invite Code</label>
              <input
                type="text"
                placeholder="e.g. TEAM-AW01"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono uppercase tracking-widest focus:outline-none focus:border-[#00d4ff]"
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full btn-neon-cyan py-3 text-xs tracking-wider"
                id="btn-submit-join-team"
              >
                Join Team
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
