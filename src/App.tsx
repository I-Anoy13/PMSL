import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  Swords, 
  Trophy, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  Users, 
  Play,
  LogIn,
  Mail,
  Copy
} from 'lucide-react';

import { MockDatabase, UserProfile, Team, Tournament, Transaction } from './lib/mockFirebase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import AdPlayer from './components/AdPlayer';

// Import our modular pages
import PageHome from './components/PageHome';
import PageDashboard from './components/PageDashboard';
import PageTeams from './components/PageTeams';
import PageTournaments from './components/PageTournaments';
import PageResults from './components/PageResults';
import PageEarnCoins from './components/PageEarnCoins';
import PageProfile from './components/PageProfile';
import PageAdmin from './components/PageAdmin';

export default function App() {
  // Global View Navigation State
  const [activePage, setActivePage] = useState<string>('home');
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Simulated Collections
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Authentication Dialog overlay
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Active details / ad state
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [adPurpose, setAdPurpose] = useState<{ type: 'rewarded_coins' | 'gate_results'; tourId?: string } | null>(null);
  const [hasWatchedResultsFor, setHasWatchedResultsFor] = useState<string[]>([]);

  // Custom persistent notifications / toasts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Initialize DB and fetch states
  useEffect(() => {
    MockDatabase.initialize();
    syncLocalState();

    // Check if user was previously logged in
    const cachedUid = localStorage.getItem('pmsl_active_uid');
    if (cachedUid) {
      const foundUser = MockDatabase.getUser(cachedUid);
      if (foundUser) {
        setUser(foundUser);
        // Track login log
        addSystemLog(foundUser.uid, 'Session restored: ' + foundUser.name);
      }
    }

    // Set up database change listeners
    const handleDbUpdate = () => {
      syncLocalState();
    };
    window.addEventListener('pmsl-db-update', handleDbUpdate);
    return () => {
      window.removeEventListener('pmsl-db-update', handleDbUpdate);
    };
  }, []);

  // Fetch or sync the states with the localStorage collections
  const syncLocalState = () => {
    const tourList = MockDatabase.getCollection<Tournament>('tournaments');
    const teamList = MockDatabase.getCollection<Team>('teams');
    const userList = MockDatabase.getCollection<UserProfile>('users');
    const txList = MockDatabase.getCollection<Transaction>('transactions');

    setTournaments(tourList);
    setTeams(teamList);
    setAllUsers(userList);
    setTransactions(txList);

    // If logged in, update the live user reference
    const cachedUid = localStorage.getItem('pmsl_active_uid');
    if (cachedUid) {
      const foundUser = userList.find(u => u.uid === cachedUid);
      if (foundUser) {
        setUser(foundUser);
      }
    }
  };

  // Helper helper to create transactions easily
  const createSimulatedTransaction = (
    uid: string,
    amount: number,
    type: 'earned' | 'spent',
    source: 'ad_watch' | 'tournament_win' | 'tournament_entry' | 'daily_bonus' | 'referral',
    description: string
  ) => {
    MockDatabase.addTransaction({
      userId: uid,
      amount,
      type,
      source,
      description
    });
  };

  // Helper system to fire toasts
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Log system activity to transactions ledger or logs
  const addSystemLog = (uid: string, msg: string) => {
    console.log(`[PMSL LOG] [${uid}]: ${msg}`);
  };

  // Check if active user is admin
  const isAdmin = user?.email === 'anoypak3@gmail.com';

  // --- Auth Handlers ---
  const handleSimulatedGoogleLogin = (role: 'admin' | 'player') => {
    const profile: UserProfile = {
      uid: role === 'admin' ? 'uid-admin-99' : 'uid-player-11',
      name: role === 'admin' ? 'PMSL Administrator' : 'PUBG_Mobile_Pro',
      email: role === 'admin' ? 'anoypak3@gmail.com' : 'player_zero@gmail.com',
      photoURL: role === 'admin' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80' 
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop&q=80',
      coins: 100, // starting coins as specified
      teamId: null,
      level: 'Bronze',
      stats: {
        matches: 0,
        wins: 0,
        kills: 0,
        top10: 0
      },
      adsWatchedToday: 0,
      lastAdWatchDate: null,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      referralCode: role === 'admin' ? 'REF-ADM9' : 'REF-PLAY1',
      referredBy: null,
      achievements: ['team_player']
    };

    // Save user to simulated DB
    MockDatabase.saveUser(profile);
    localStorage.setItem('pmsl_active_uid', profile.uid);
    setUser(profile);
    setShowLoginModal(false);
    showToast(`Logged in successfully! +100 free coins credited.`, 'success');

    // Add first sign-up transaction if no prior ledger exists
    const txs = MockDatabase.getCollection<Transaction>('transactions');
    const userHasTx = txs.some(t => t.userId === profile.uid);
    if (!userHasTx) {
      createSimulatedTransaction(
        profile.uid,
        100,
        'earned',
        'daily_bonus',
        'Initial Google Sign-on Bonus'
      );
    }

    addSystemLog(profile.uid, 'User logged in: ' + profile.name);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('pmsl_active_uid');
    setUser(null);
    setActivePage('home');
    showToast('Logged out successfully.', 'info');
  };

  // --- Coin/Reward Actions ---
  const handleClaimDailyBonus = () => {
    if (!user) return;
    
    // update user coins
    const updated = { ...user };
    updated.coins += 10;
    MockDatabase.saveUser(updated);

    createSimulatedTransaction(
      user.uid,
      10,
      'earned',
      'daily_bonus',
      'Daily Login Claim'
    );
    
    showToast('Daily subsidy +10 coins claimed!', 'success');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast('Code copied to clipboard: ' + code, 'success');
  };

  // --- Ad Watch Integration ---
  const triggerRewardedAdWatch = () => {
    if (!user) {
      showToast('Please login to watch sponsor broadcasts.', 'error');
      return;
    }
    if (user.adsWatchedToday >= 5) {
      showToast('Daily ad limit reached! Come back tomorrow.', 'error');
      return;
    }

    setAdPurpose({ type: 'rewarded_coins' });
    setIsAdOpen(true);
  };

  const triggerAdGateWatch = (tourId: string, onComplete: () => void) => {
    setAdPurpose({ type: 'gate_results', tourId });
    setIsAdOpen(true);
  };

  const handleAdPlayerComplete = () => {
    setIsAdOpen(false);

    if (adPurpose?.type === 'rewarded_coins') {
      if (user) {
        const updated = { ...user };
        updated.coins += 15;
        updated.adsWatchedToday += 1;
        updated.lastAdWatchDate = new Date().toISOString();
        
        // update Level badge based on total historical coins earned
        const txs = MockDatabase.getCollection<Transaction>('transactions');
        const totalEarned = txs
          .filter(t => t.userId === user.uid && t.type === 'earned')
          .reduce((sum, t) => sum + t.amount, 0) + 115; // include current
        
        updated.level = MockDatabase.getLevel(totalEarned);
        MockDatabase.saveUser(updated);

        createSimulatedTransaction(
          user.uid,
          15,
          'earned',
          'ad_watch',
          'Sponsor Transmission Ad Reward'
        );

        showToast('+15 coins added! 🪙', 'success');
      }
    } else if (adPurpose?.type === 'gate_results' && adPurpose.tourId) {
      const tourId = adPurpose.tourId;
      setHasWatchedResultsFor(prev => [...prev, tourId]);
      showToast('Transmission complete. Results unlocked!', 'success');

      // Trigger win payout coins to the winning team if they are in the database!
      const tour = tournaments.find(t => t.id === tourId);
      if (tour && tour.results?.winner) {
        const winningTeam = teams.find(t => t.id === tour.results.winner);
        if (winningTeam) {
          // credit prize to captain
          const captainProfile = MockDatabase.getUser(winningTeam.captainId);
          if (captainProfile) {
            const up = { ...captainProfile };
            up.coins += tour.prizePool;
            MockDatabase.saveUser(up);

            // Add transaction for winner
            MockDatabase.addTransaction({
              userId: up.uid,
              amount: tour.prizePool,
              type: 'earned',
              source: 'tournament_win',
              description: `Tournament Prize: 1st Place in ${tour.name}`
            });
            showToast(`Awarded ${tour.prizePool} Coins to Winning Squad Captain!`, 'success');
          }
        }
      }
    }

    setAdPurpose(null);
  };

  const handleAdPlayerCancel = () => {
    setIsAdOpen(false);
    setAdPurpose(null);
    showToast('Ad failed to load or skipped. Please try again.', 'error');
  };

  // --- Team Actions ---
  const handleTeamStateChange = (newTeam: Team | null) => {
    if (user) {
      const updatedUser = { ...user, teamId: newTeam ? newTeam.id : null };
      MockDatabase.saveUser(updatedUser);
      setUser(updatedUser);
      syncLocalState();
      
      if (newTeam) {
        showToast(`Squad [${newTeam.tag}] configured successfully!`, 'success');
      } else {
        showToast('Left squad successfully.', 'info');
      }
    }
  };

  // --- Tournament Registration ---
  const handleRegisterTournament = (tourId: string) => {
    if (!user) {
      showToast('You need to login first.', 'error');
      setShowLoginModal(true);
      return;
    }
    if (!user.teamId) {
      showToast('You need to be in a team to register.', 'error');
      setActivePage('teams');
      return;
    }

    const tour = tournaments.find(t => t.id === tourId);
    if (!tour) return;

    if (user.coins < tour.entryFee) {
      showToast("You don't have enough coins. Watch ads to earn more!", 'error');
      setActivePage('earn-coins');
      return;
    }

    // Register
    const error = MockDatabase.registerTeamForTournament(tourId, user.teamId);
    if (error) {
      showToast(error, 'error');
    } else {
      // Deduct fee from captain
      const updated = { ...user };
      updated.coins -= tour.entryFee;
      MockDatabase.saveUser(updated);

      createSimulatedTransaction(
        user.uid,
        tour.entryFee,
        'spent',
        'tournament_entry',
        `Registered for ${tour.name}`
      );

      showToast(`✅ Registered for ${tour.name}!`, 'success');
      syncLocalState();
    }
  };

  // --- Admin actions ---
  const handleAdminCreateTournament = (newTour: Tournament) => {
    syncLocalState();
    showToast(`Admin: Custom League [${newTour.name}] created successfully!`, 'success');
  };

  const handleAdminUpdateStatus = (
    tourId: string, 
    status: 'upcoming' | 'ongoing' | 'completed',
    results?: any
  ) => {
    const list = MockDatabase.getCollection<Tournament>('tournaments');
    const index = list.findIndex(t => t.id === tourId);
    if (index >= 0) {
      list[index].status = status;
      if (results) {
        list[index].results = results;
      }
      MockDatabase.setCollection('tournaments', list);
      showToast(`Admin: Updated status to ${status.toUpperCase()}`, 'success');
    }
  };

  // Get active team details for user
  const activeTeam = user && user.teamId ? teams.find(t => t.id === user.teamId) || null : null;

  // Filter transactions of active user
  const userTransactions = user ? transactions.filter(t => t.userId === user.uid) : [];

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white flex flex-col font-sans selection:bg-[#00ff87]/30 selection:text-white">
      {/* Animated Glowing Particle Background */}
      <ParticleBackground />

      {/* Header / Navbar */}
      <Navbar 
        user={user} 
        activePage={activePage} 
        setActivePage={setActivePage}
        onLoginClick={() => setShowLoginModal(true)}
        onLogoutClick={handleLogout}
        isAdmin={isAdmin}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
        
        {/* Toast Alerts Notification System */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-4 z-50 pointer-events-none"
            >
              <div className={`flex items-center gap-2.5 px-4.5 py-3 rounded-xl border shadow-2xl backdrop-blur-md ${
                toast.type === 'success' 
                  ? 'bg-emerald-500/10 border-[#00ff87]/40 text-[#00ff87]' 
                  : toast.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                  : 'bg-slate-800/85 border-slate-700 text-[#00d4ff]'
              }`}>
                {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-[#00ff87]" /> : <AlertCircle className="w-5 h-5" />}
                <span className="text-xs font-bold uppercase tracking-wider">{toast.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View switching panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activePage === 'home' && (
              <PageHome 
                upcomingTournaments={tournaments.filter(t => t.status !== 'completed')}
                teams={teams}
                userTeamId={user?.teamId || null}
                onLoginClick={() => setShowLoginModal(true)}
                onRegisterTournament={handleRegisterTournament}
                onSelectTournament={(id) => {
                  const t = tournaments.find(tour => tour.id === id);
                  if (t) setSelectedTournament(t);
                }}
                user={user}
                setActivePage={setActivePage}
              />
            )}

            {activePage === 'dashboard' && user && (
              <PageDashboard 
                user={user}
                team={activeTeam}
                recentTransactions={userTransactions}
                onEarnCoinsClick={() => setActivePage('earn-coins')}
                onCreateTeamClick={() => setActivePage('teams')}
                onJoinTeamClick={() => setActivePage('teams')}
                onCopyCode={handleCopyCode}
              />
            )}

            {activePage === 'teams' && user && (
              <PageTeams 
                user={user}
                team={activeTeam}
                allUsers={allUsers}
                onTeamCreated={handleTeamStateChange}
                onTeamJoined={handleTeamStateChange}
                onTeamLeft={() => handleTeamStateChange(null)}
                onCopyCode={handleCopyCode}
              />
            )}

            {activePage === 'tournaments' && (
              <PageTournaments 
                tournaments={tournaments}
                teams={teams}
                userTeamId={user?.teamId || null}
                onRegisterTournament={handleRegisterTournament}
                onSelectTournament={(id) => {
                  const t = tournaments.find(tour => tour.id === id);
                  if (t) setSelectedTournament(t);
                }}
                selectedTournament={selectedTournament}
                onCloseDetails={() => setSelectedTournament(null)}
                user={user}
                onTriggerAdGate={triggerAdGateWatch}
                hasWatchedResultsFor={hasWatchedResultsFor}
              />
            )}

            {activePage === 'results' && (
              <PageResults 
                tournaments={tournaments}
                teams={teams}
                onTriggerAdGate={triggerAdGateWatch}
                hasWatchedResultsFor={hasWatchedResultsFor}
              />
            )}

            {activePage === 'earn-coins' && user && (
              <PageEarnCoins 
                user={user}
                transactions={userTransactions}
                onWatchAdClick={triggerRewardedAdWatch}
                onClaimDaily={handleClaimDailyBonus}
                hasClaimedDaily={userTransactions.some(t => t.source === 'daily_bonus' && new Date(t.timestamp).toDateString() === new Date().toDateString())}
                onCopyReferral={handleCopyCode}
              />
            )}

            {activePage === 'profile' && user && (
              <PageProfile 
                user={user}
                transactions={userTransactions}
                onLogoutClick={handleLogout}
              />
            )}

            {activePage === 'admin' && isAdmin && (
              <PageAdmin 
                tournaments={tournaments}
                teams={teams}
                onCreateTournament={handleAdminCreateTournament}
                onUpdateTournamentStatus={handleAdminUpdateStatus}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Area */}
      <Footer setActivePage={setActivePage} />

      {/* Ad Player Overlay */}
      <AdPlayer 
        isOpen={isAdOpen}
        onComplete={handleAdPlayerComplete}
        onCancel={handleAdPlayerCancel}
      />

      {/* Simulation Secure login modal popup overlay */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel border-[#00ff87]/30 p-6 max-w-sm w-full relative space-y-6 text-center shadow-2xl"
            >
              {/* Close Modal button */}
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2">
                <div className="w-12 h-12 bg-[#00ff87]/15 border border-[#00ff87]/30 text-[#00ff87] rounded-xl flex items-center justify-center mx-auto shadow-md">
                  <LogIn className="w-6 h-6" />
                </div>
                <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
                  Secure Google Portal Login
                </h3>
                <p className="text-[11px] text-[#a0b4c8] leading-relaxed">
                  Authenticate your credentials to claim <strong>100 welcome coins</strong> and configure your squad.
                </p>
              </div>

              {/* Login pathways buttons */}
              <div className="space-y-3 pt-2">
                {/* Regular login */}
                <button
                  onClick={() => handleSimulatedGoogleLogin('player')}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#0a0e17] hover:bg-slate-900 border border-white/10 hover:border-[#00d4ff] text-white rounded-lg text-xs font-bold transition-all uppercase font-mono shadow-inner"
                  id="btn-login-player"
                >
                  <Mail className="w-4 h-4 text-[#00d4ff]" />
                  <span>Google Player Account</span>
                </button>

                {/* Admin login */}
                <button
                  onClick={() => handleSimulatedGoogleLogin('admin')}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#0a0e17] hover:bg-slate-900 border border-white/10 hover:border-[#00ff87] text-[#00ff87] rounded-lg text-xs font-bold transition-all uppercase font-mono shadow-inner"
                  id="btn-login-admin"
                >
                  <ShieldCheck className="w-4 h-4 text-[#00ff87]" />
                  <span>Google Admin Account</span>
                </button>
              </div>

              <p className="text-[9px] text-slate-500 leading-snug">
                Simulated Google single-sign-on protocol. Choosing either account provides high fidelity local sandboxing immediately.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
