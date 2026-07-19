import React, { useState, useEffect } from 'react';
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
  Copy,
  ExternalLink
} from 'lucide-react';

import { MockDatabase, UserProfile, Team, Tournament, Transaction } from './lib/mockFirebase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import AdPlayer from './components/AdPlayer';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from './lib/firebase';

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
  const [loginTrouble, setLoginTrouble] = useState(false);
  const [dismissIframeWarning, setDismissIframeWarning] = useState(false);

  // Active details / ad state
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [adPurpose, setAdPurpose] = useState<{ type: 'rewarded_coins' | 'gate_results' | 'slot_view' | 'login_pop'; tourId?: string } | null>(null);
  const [hasWatchedResultsFor, setHasWatchedResultsFor] = useState<string[]>([]);
  const [hasWatchedSlotsFor, setHasWatchedSlotsFor] = useState<string[]>([]);

  // Onboarding states for Game IGN & Full Name
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardGameName, setOnboardGameName] = useState('');
  const [onboardFullName, setOnboardFullName] = useState('');

  // Custom persistent notifications / toasts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Initialize DB and fetch states
  useEffect(() => {
    // Set up database change listeners first so we don't miss initial load updates!
    const handleDbUpdate = () => {
      syncLocalState();
    };

    const handleSyncError = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { collection, error } = customEvent.detail || {};
      console.error(`[PMSL Sync Error] Collection: ${collection}`, error);
      showToast(`Sync Error (${collection}): Please check database permissions or network connection.`, 'error');
    };

    window.addEventListener('pmsl-db-update', handleDbUpdate);
    window.addEventListener('pmsl-sync-error', handleSyncError);

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

    return () => {
      window.removeEventListener('pmsl-db-update', handleDbUpdate);
      window.removeEventListener('pmsl-sync-error', handleSyncError);
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

  // Check if active user is admin/owner based on their user role
  const isOwner = user?.email === 'anoypak3@gmail.com' || user?.role === 'owner';
  const isAdmin = isOwner || user?.role === 'admin';

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        const email = firebaseUser.email || '';
        const name = firebaseUser.displayName || 'PUBG Player';
        const photoURL = firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop&q=80';

        // Try getting user profile directly from Firestore first, falling back to local cache
        let existingUser = await MockDatabase.getUserFromFirestore(uid);
        if (!existingUser) {
          existingUser = MockDatabase.getUser(uid);
        }
        
        if (!existingUser) {
          existingUser = {
            uid,
            name,
            email,
            photoURL,
            coins: 100, // Claim 100 welcome coins!
            teamId: null,
            level: 'Bronze',
            role: email === 'anoypak3@gmail.com' ? 'owner' : 'user',
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
            referralCode: 'REF-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
            referredBy: null,
            achievements: ['team_player'],
            gameName: '',
            fullName: ''
          };
          MockDatabase.saveUser(existingUser);

          createSimulatedTransaction(
            uid,
            100,
            'earned',
            'daily_bonus',
            'Google Live Login Welcome Bonus'
          );
        } else {
          // Keep local cached user and Firebase properties synchronized
          let changed = false;
          if (existingUser.name !== name) { existingUser.name = name; changed = true; }
          if (existingUser.email !== email) { existingUser.email = email; changed = true; }
          if (existingUser.photoURL !== photoURL) { existingUser.photoURL = photoURL; changed = true; }
          
          if (!existingUser.role) {
            existingUser.role = email === 'anoypak3@gmail.com' ? 'owner' : 'user';
            changed = true;
          }

          // Reset daily watch limits if midnight has passed
          const todayStr = new Date().toDateString();
          if (existingUser.lastAdWatchDate) {
            const lastDate = new Date(existingUser.lastAdWatchDate).toDateString();
            if (lastDate !== todayStr) {
              existingUser.adsWatchedToday = 0;
              changed = true;
            }
          }
          
          if (changed) {
            existingUser.lastLogin = new Date().toISOString();
            MockDatabase.saveUser(existingUser);
          }
        }

        // Check if onboarding needs to be shown
        if (!existingUser.gameName || !existingUser.fullName) {
          setOnboardGameName(existingUser.gameName || '');
          setOnboardFullName(existingUser.fullName || '');
          setShowOnboarding(true);
        }

        localStorage.setItem('pmsl_active_uid', existingUser.uid);
        setUser(existingUser);
        addSystemLog(uid, 'Session authenticated: ' + name);
      } else {
        localStorage.removeItem('pmsl_active_uid');
        setUser(null);
        setShowOnboarding(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoginTrouble(false);
      const result = await signInWithPopup(auth, googleProvider);
      const name = result.user.displayName || 'PUBG Player';
      showToast(`Logged in as ${name}!`, 'success');
      setShowLoginModal(false);
      setActivePage('dashboard');
    } catch (error: any) {
      console.error('Error during Google sign-in:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        showToast('Google login was cancelled.', 'info');
      } else if (error.code === 'auth/popup-blocked') {
        showToast('Popup blocked! Please allow popups or open the app in a new tab.', 'error');
        setLoginTrouble(true);
      } else if (error.code === 'auth/cancelled-popup-request') {
        showToast('Another login request was started or cancelled.', 'info');
        setLoginTrouble(true);
      } else {
        showToast(error.message || 'Google sign-in failed.', 'error');
        setLoginTrouble(true);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Firebase Auth logout error:', error);
    }
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
    updated.coins += 25;
    MockDatabase.saveUser(updated);

    createSimulatedTransaction(
      user.uid,
      25,
      'earned',
      'daily_bonus',
      'Daily Login Claim'
    );
    
    showToast('Daily subsidy +25 coins claimed!', 'success');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast('Code copied to clipboard: ' + code, 'success');
  };

  // --- Onboarding Action ---
  const handleSaveOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!onboardGameName.trim() || !onboardFullName.trim()) {
      showToast('Please enter both your Full Name and PUBG Game Name.', 'error');
      return;
    }

    const updated = { ...user };
    updated.gameName = onboardGameName.trim();
    updated.fullName = onboardFullName.trim();
    MockDatabase.saveUser(updated);
    setUser(updated);
    setShowOnboarding(false);
    showToast('Onboarding completed! Welcome to the Arena.', 'success');

    // Trigger Successful Login Ad POP!
    const config = MockDatabase.getAdsConfig();
    if (config.loginAdLink && config.loginAdLink.startsWith('http')) {
      setTimeout(() => {
        setAdPurpose({ type: 'login_pop' });
        setIsAdOpen(true);
      }, 500);
    }
  };

  // --- Ad Watch Integration ---
  const triggerRewardedAdWatch = () => {
    if (!user) {
      showToast('Please login to watch sponsor broadcasts.', 'error');
      return;
    }
    if (user.adsWatchedToday >= 6) {
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

  const triggerSlotAdGateWatch = (tourId: string) => {
    setAdPurpose({ type: 'slot_view', tourId });
    setIsAdOpen(true);
  };

  const handleAdPlayerComplete = () => {
    setIsAdOpen(false);

    if (adPurpose?.type === 'rewarded_coins') {
      if (user) {
        const updated = { ...user };
        updated.coins += 50;
        updated.adsWatchedToday += 1;
        updated.lastAdWatchDate = new Date().toISOString();
        
        // update Level badge based on total historical coins earned
        const txs = MockDatabase.getCollection<Transaction>('transactions');
        const totalEarned = txs
          .filter(t => t.userId === user.uid && t.type === 'earned')
          .reduce((sum, t) => sum + t.amount, 0) + 150; // include current
        
        updated.level = MockDatabase.getLevel(totalEarned);
        MockDatabase.saveUser(updated);

        createSimulatedTransaction(
          user.uid,
          50,
          'earned',
          'ad_watch',
          'Sponsor Transmission Ad Reward'
        );

        showToast('+50 coins added! 🪙', 'success');
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
    } else if (adPurpose?.type === 'slot_view' && adPurpose.tourId) {
      const tourId = adPurpose.tourId;
      setHasWatchedSlotsFor(prev => [...prev, tourId]);
      showToast('Transmission complete. Slot boards unlocked!', 'success');
    } else if (adPurpose?.type === 'login_pop') {
      showToast('Welcome Back Sponsor Redirect Loaded Successfully!', 'success');
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

  // Detect if we are loading inside the popup Callback
  if (window.location.pathname === '/auth/callback' || window.location.pathname === '/auth/callback/') {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const token = params.get('access_token');
    
    if (token) {
      if (window.opener) {
        window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', accessToken: token }, window.location.origin);
        window.close();
      }
    } else {
      const search = window.location.search;
      const queryParams = new URLSearchParams(search);
      const error = queryParams.get('error');
      if (error && window.opener) {
        window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error }, window.location.origin);
        window.close();
      }
    }

    return (
      <div className="min-h-screen bg-[#0a0e17] text-white flex flex-col items-center justify-center font-sans p-6 text-center">
        <div className="space-y-4">
          <div className="w-10 h-10 border-2 border-[#00ff87] border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-sm font-bold font-display uppercase tracking-widest text-[#00ff87]">
            Google Authentication Successful
          </h2>
          <p className="text-[10px] text-slate-400">
            Finalizing connection. This portal window will close shortly...
          </p>
        </div>
      </div>
    );
  }

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
                hasWatchedSlotsFor={hasWatchedSlotsFor}
                onTriggerSlotAdGate={triggerSlotAdGateWatch}
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

            {activePage === 'admin' && isAdmin && user && (
              <PageAdmin 
                tournaments={tournaments}
                teams={teams}
                allUsers={allUsers}
                onCreateTournament={handleAdminCreateTournament}
                onUpdateTournamentStatus={handleAdminUpdateStatus}
                currentUser={user}
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
        adUrl={(() => {
          if (!adPurpose) return undefined;
          const config = MockDatabase.getAdsConfig();
          if (adPurpose.type === 'rewarded_coins') return config.earnAdLink;
          if (adPurpose.type === 'gate_results') return config.resultsAdLink;
          if (adPurpose.type === 'slot_view') return config.slotsAdLink;
          if (adPurpose.type === 'login_pop') return config.loginAdLink;
          return undefined;
        })()}
      />

      {/* Real Live Google login modal popup overlay */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel border-[#00ff87]/30 p-6 max-w-md w-full relative space-y-5 text-center shadow-2xl"
            >
              {/* Close Modal button */}
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginTrouble(false);
                }}
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

              {/* Troubleshooting warning box for Iframes / Popup Blockers */}
              {((window.self !== window.top) || loginTrouble) && !dismissIframeWarning && (
                <div className="text-left bg-slate-950/80 border border-yellow-500/30 rounded-xl p-4 font-mono text-[10px] leading-relaxed space-y-2 relative">
                  {window.self !== window.top ? (
                    <>
                      <div className="flex items-center justify-between text-yellow-500 font-bold uppercase tracking-wider pr-4">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Iframe Preview Detected</span>
                        </div>
                      </div>
                      <p className="text-slate-400 font-sans text-[10.5px]">
                        You are running inside an embedded preview iframe. Browser security policies block authentication popups here.
                      </p>
                      <p className="text-slate-400 font-sans text-[10.5px]">
                        Please click below to open the app in a standalone tab and sign in smoothly.
                      </p>
                      <div className="pt-1">
                        <button
                          onClick={() => window.open(window.location.href, '_blank')}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#00ff87]/15 hover:bg-[#00ff87]/25 border border-[#00ff87]/30 text-[#00ff87] rounded text-[11px] font-black uppercase transition font-sans cursor-pointer w-full justify-center"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open App in New Tab</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-amber-500 font-bold uppercase tracking-wider pr-4">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Popup Blocker Enabled</span>
                        </div>
                      </div>
                      <p className="text-slate-400 font-sans text-[10.5px]">
                        Your browser blocked the Google authentication popup. 
                      </p>
                      <p className="text-slate-400 font-sans text-[10.5px]">
                        Please click the lock/pop-up icon in your browser's address bar to <strong>"Allow popups"</strong> for this site, then try clicking "Continue with Google" again.
                      </p>
                    </>
                  )}
                  <button
                    onClick={() => setDismissIframeWarning(true)}
                    className="absolute top-3.5 right-3.5 p-0.5 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white"
                    title="Dismiss alert"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Google Login via Firebase Auth */}
              <div className="space-y-3 pt-1">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-white hover:bg-slate-100 border border-transparent text-slate-900 rounded-lg text-xs font-black transition-all uppercase font-sans shadow-md cursor-pointer"
                  id="btn-real-google-login"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              <p className="text-[9px] text-slate-500 leading-snug">
                This app uses Google's live single-sign-on protocol. First-time login automatically syncs your profile.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Onboarding Dialog Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-panel border-[#00ff87]/30 max-w-md w-full p-6 md:p-8 space-y-6 text-center shadow-[0_0_50px_rgba(0,255,135,0.15)] rounded-3xl"
            >
              <div className="w-16 h-16 bg-[#00ff87]/15 rounded-2xl flex items-center justify-center mx-auto border border-[#00ff87]/30 text-3xl animate-bounce">
                🎮
              </div>

              <div className="space-y-1.5">
                <h2 className="font-display font-black text-lg md:text-xl text-white uppercase tracking-wider">
                  Complete Player Profile
                </h2>
                <p className="text-xs text-[#a0b4c8] leading-relaxed">
                  Welcome to PUBG Mobile Esports Arena! To participate in custom lobby Tournaments and claim your coin winnings, please set up your gaming credentials.
                </p>
              </div>

              <form onSubmit={handleSaveOnboarding} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
                    Full Name (Real Identity)
                  </label>
                  <input
                    type="text"
                    required
                    value={onboardFullName}
                    onChange={(e) => setOnboardFullName(e.target.value)}
                    placeholder="Enter your real name..."
                    className="w-full bg-black/50 border border-white/10 focus:border-[#00ff87] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-all font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
                    PUBG Game Name (Character IGN)
                  </label>
                  <input
                    type="text"
                    required
                    value={onboardGameName}
                    onChange={(e) => setOnboardGameName(e.target.value)}
                    placeholder="e.g. ANOY・GAMING"
                    className="w-full bg-black/50 border border-white/10 focus:border-[#00ff87] rounded-xl px-4 py-2.5 text-xs text-[#00ff87] focus:outline-none transition-all font-mono font-bold"
                  />
                  <p className="text-[9px] text-slate-500 leading-normal">
                    Must exactly match your in-game nickname so admins can verify match lobbies.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#00ff87] text-slate-950 font-black text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-[0_0_20px_rgba(0,255,135,0.25)] hover:scale-[1.02] transition transform active:scale-95 text-center block mt-6 cursor-pointer"
                >
                  Save and Enter Arena 🚀
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
