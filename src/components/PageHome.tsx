import React from 'react';
import { LogIn, Trophy, Swords, ShieldCheck, Zap, Users, Play } from 'lucide-react';
import { Tournament, Team } from '../lib/mockFirebase';
import TournamentCard from './TournamentCard';

interface PageHomeProps {
  upcomingTournaments: Tournament[];
  teams: Team[];
  userTeamId: string | null;
  onLoginClick: () => void;
  onRegisterTournament: (id: string) => void;
  onSelectTournament: (id: string) => void;
  user: any;
  setActivePage: (page: string) => void;
}

export default function PageHome({
  upcomingTournaments,
  teams,
  userTeamId,
  onLoginClick,
  onRegisterTournament,
  onSelectTournament,
  user,
  setActivePage
}: PageHomeProps) {
  // Take up to 3 upcoming tournaments
  const featured = upcomingTournaments.slice(0, 3);

  return (
    <div className="space-y-16 py-10">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto px-4 relative py-12 md:py-20 flex flex-col items-center">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#00ff87]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00d4ff]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-full text-xs font-mono font-bold uppercase tracking-widest text-[#00ff87] mb-4">
          <Zap className="w-3.5 h-3.5" />
          <span>PUBG Mobile Custom Leagues</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight leading-none text-white uppercase select-none drop-shadow-[0_0_15px_rgba(0,255,135,0.2)]">
          PUBG Mobile <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff87] to-[#00d4ff] drop-shadow-[0_0_30px_rgba(0,212,255,0.3)]">
            Tournaments
          </span>
        </h1>

        <p className="max-w-xl text-[#a0b4c8] text-sm md:text-base leading-relaxed mx-auto">
          The ultimate platform for mobile esports squads. Register your team, watch high-stakes visual ad transmissions to refine your wallet, and dominate custom lobby scrims to claim actual coin prize pools.
        </p>

        {/* Dynamic primary CTA based on user authentication */}
        <div className="pt-4">
          {user ? (
            <button
              onClick={() => setActivePage('dashboard')}
              className="action-btn px-8 py-4 rounded-full text-xs font-black tracking-widest uppercase transition-all flex items-center gap-2"
              id="btn-hero-dashboard"
            >
              <Swords className="w-4 h-4" />
              <span>Go To Dashboard</span>
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="action-btn px-8 py-4 rounded-full text-xs font-black tracking-widest uppercase transition-all flex items-center gap-2.5 animate-pulse"
              id="btn-hero-login"
            >
              <LogIn className="w-4 h-4" />
              <span>Login with Google</span>
            </button>
          )}
        </div>
      </section>

      {/* 3 Upcoming Tournaments Grid */}
      <section className="space-y-6 max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">
              Featured Tournaments
            </h2>
            <p className="text-xs text-[#a0b4c8]">Currently accepting registrations. Form your squad now.</p>
          </div>
          <button
            onClick={() => setActivePage('tournaments')}
            className="text-xs font-semibold text-[#00ff87] hover:underline flex items-center gap-1 mt-2 sm:mt-0"
          >
            View All Tournaments &rarr;
          </button>
        </div>

        {featured.length === 0 ? (
          <div className="text-center p-12 glass-panel border-[#00ff87]/10">
            <p className="text-[#a0b4c8] text-sm italic">No upcoming tournaments listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((tour) => (
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
      </section>

      {/* How It Works Section */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center space-y-2 mb-12">
          <h2 className="font-display font-black text-xl md:text-2xl text-white uppercase tracking-wider">
            How It Works
          </h2>
          <p className="text-xs text-[#a0b4c8]">Claim your custom lobby champion rewards in 3 simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="glass-panel border-[#00ff87]/10 p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-full flex items-center justify-center text-[#00ff87] shadow-[0_0_15px_rgba(0,255,135,0.1)]">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display font-bold text-sm text-white uppercase">1. Recruit Your Squad</h3>
              <p className="text-[#a0b4c8] text-xs leading-relaxed">
                Connect with Google and establish your official gaming squad tag or submit an invite code to join forces with your teammates.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-panel border-[#00ff87]/10 p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-full flex items-center justify-center text-[#00d4ff] shadow-[0_0_15px_rgba(0,212,255,0.1)]">
              <Play className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display font-bold text-sm text-white uppercase">2. Watch & Earn Coins</h3>
              <p className="text-[#a0b4c8] text-xs leading-relaxed">
                Need lobby entry fees? Safely play rewarding 6-second visual transmissions to claim instant coins for your squad.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-panel border-[#00ff87]/10 p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display font-bold text-sm text-white uppercase">3. Battle & Claim Victory</h3>
              <p className="text-[#a0b4c8] text-xs leading-relaxed">
                Register for active tournament slots, conquer custom custom scrim tables, and win heavy coin payouts automatically.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
