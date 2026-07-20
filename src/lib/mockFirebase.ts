import { CoinTransaction } from '../types';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  coins: number;
  teamId: string | null;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  stats: {
    matches: number;
    wins: number;
    kills: number;
    top10: number;
  };
  adsWatchedToday: number;
  lastAdWatchDate: string | null;
  createdAt: string;
  lastLogin: string;
  referralCode: string;
  referredBy: string | null;
  achievements: string[];
  role?: 'user' | 'admin' | 'owner';
  gameName?: string;
  fullName?: string;
  dailyCheckInDate?: string | null;
}

export interface SystemConfig {
  id: string; // 'ads_config'
  resultsAdLink: string;
  slotsAdLink: string;
  earnAdLink: string;
  loginAdLink: string;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  logo: string;
  captainId: string;
  members: string[]; // array of user uids
  inviteCode: string; // TEAM-XXXX
  createdAt: string;
  totalMatches: number;
  totalWins: number;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  date: string;
  entryFee: number;
  prizePool: number;
  maxTeams: number;
  registeredTeams: string[]; // array of team ids
  status: 'upcoming' | 'ongoing' | 'completed';
  results: {
    winner: string | null; // team id or name
    runnerUp: string | null;
    third: string | null;
  };
  createdAt: string;
  slots?: Record<string, string>; // Maps "slotNumber" (e.g., "1", "2") to teamId
  matchResults?: Array<{
    matchNumber: number;
    map: string;
    rankings: Array<{
      teamId: string;
      placement: number; // 1 to 16
      kills: number;
      totalPoints: number;
    }>;
  }>;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'spent';
  source: 'ad_watch' | 'tournament_win' | 'tournament_entry' | 'daily_bonus' | 'referral';
  description: string;
  timestamp: string;
}

export class MockDatabase {
  static getCollection<T>(key: string, initialSeed: T[] = []): T[] {
    const data = localStorage.getItem(`pmsl_col_${key}`);
    if (!data) {
      localStorage.setItem(`pmsl_col_${key}`, JSON.stringify(initialSeed));
      return initialSeed;
    }
    return JSON.parse(data);
  }

  // Purely updates the local storage cache without writing back to Firestore (called from snapshot listeners)
  static setCollectionFromFirestore<T>(key: string, items: T[]): void {
    if (key === 'users') {
      const activeUid = localStorage.getItem('pmsl_active_uid');
      if (activeUid) {
        const hasActive = (items as any[]).some(u => u.uid === activeUid);
        if (!hasActive) {
          const cachedActive = localStorage.getItem(`pmsl_user_profile_${activeUid}`);
          if (cachedActive) {
            try {
              items.push(JSON.parse(cachedActive));
            } catch (e) {}
          }
        }
      }
    }
    localStorage.setItem(`pmsl_col_${key}`, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('pmsl-db-update', { detail: { key } }));
  }

  // Standard collection writer (writes local state and pushes back to Firestore asynchronously)
  static setCollection<T>(key: string, items: T[]): void {
    localStorage.setItem(`pmsl_col_${key}`, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('pmsl-db-update', { detail: { key } }));

    // Sync individual modified items to Firestore in the background
    if (key === 'tournaments') {
      items.forEach((item: any) => {
        if (item && item.id) {
          setDoc(doc(db, 'tournaments', item.id), item).catch(err => {
            console.error("Error syncing tournament update to Firestore:", err);
          });
        }
      });
    } else if (key === 'users') {
      items.forEach((item: any) => {
        if (item && item.uid) {
          setDoc(doc(db, 'users', item.uid), item).catch(err => {
            console.error("Error syncing user update to Firestore:", err);
          });
        }
      });
    } else if (key === 'teams') {
      items.forEach((item: any) => {
        if (item && item.id) {
          setDoc(doc(db, 'teams', item.id), item).catch(err => {
            console.error("Error syncing team update to Firestore:", err);
          });
        }
      });
    } else if (key === 'transactions') {
      items.forEach((item: any) => {
        if (item && item.id) {
          setDoc(doc(db, 'transactions', item.id), item).catch(err => {
            console.error("Error syncing transaction update to Firestore:", err);
          });
        }
      });
    }
  }

  // Set up live real-time synchronization with Firestore!
  static initialize() {
    // 1. Listen to users
    onSnapshot(collection(db, 'users'), (snapshot) => {
      const firestoreUsers: UserProfile[] = [];
      snapshot.forEach((doc) => {
        firestoreUsers.push({ uid: doc.id, ...doc.data() } as UserProfile);
      });
      
      if (firestoreUsers.length === 0) {
        const activeUid = localStorage.getItem('pmsl_active_uid');
        if (activeUid) {
          const cachedActive = localStorage.getItem(`pmsl_user_profile_${activeUid}`);
          if (cachedActive) {
            try {
              firestoreUsers.push(JSON.parse(cachedActive));
            } catch (e) {}
          }
        }
      }
      this.setCollectionFromFirestore<UserProfile>('users', firestoreUsers);
    }, (error) => {
      console.error("Firestore users listener error:", error);
      window.dispatchEvent(new CustomEvent('pmsl-sync-error', { detail: { collection: 'users', error } }));
    });

    // 2. Listen to teams
    onSnapshot(collection(db, 'teams'), (snapshot) => {
      const firestoreTeams: Team[] = [];
      snapshot.forEach((doc) => {
        firestoreTeams.push({ id: doc.id, ...doc.data() } as Team);
      });

      if (firestoreTeams.length === 0) {
        const cached = localStorage.getItem('pmsl_col_teams');
        let localTeams: Team[] = [];
        if (cached) {
          try {
            localTeams = JSON.parse(cached);
          } catch (e) {}
        }
        if (localTeams.length > 0) {
          console.log(`[PMSL Sync] Restoring local teams to empty Firestore...`);
          localTeams.forEach(t => {
            setDoc(doc(db, 'teams', t.id), t).catch(err => {
              console.error("Failed to restore team:", err);
            });
          });
          this.setCollectionFromFirestore<Team>('teams', localTeams);
          return;
        }
      }
      this.setCollectionFromFirestore<Team>('teams', firestoreTeams);
    }, (error) => {
      console.error("Firestore teams listener error:", error);
      window.dispatchEvent(new CustomEvent('pmsl-sync-error', { detail: { collection: 'teams', error } }));
    });

    // 3. Listen to tournaments
    onSnapshot(collection(db, 'tournaments'), (snapshot) => {
      const firestoreTournaments: Tournament[] = [];
      snapshot.forEach((doc) => {
        firestoreTournaments.push({ id: doc.id, ...doc.data() } as Tournament);
      });

      if (firestoreTournaments.length === 0) {
        // If Firestore is empty, let's check if we have tournaments in our local cache first!
        const cached = localStorage.getItem('pmsl_col_tournaments');
        let localTours: Tournament[] = [];
        if (cached) {
          try {
            localTours = JSON.parse(cached);
          } catch (e) {}
        }

        if (localTours.length > 0) {
          console.log(`[PMSL Sync] Restoring local tournaments to empty Firestore...`);
          localTours.forEach(t => {
            setDoc(doc(db, 'tournaments', t.id), t).catch(err => {
              console.error("Failed to restore tournament:", err);
            });
          });
          this.setCollectionFromFirestore<Tournament>('tournaments', localTours);
        } else {
          const defaultTournament: Tournament = {
            id: 'tour-pmsl-arena-season-1',
            name: 'PMSL Arena Season 1 Grand League',
            description: 'The ultimate showdown of professional squads. Register your team and battle for the massive prize pool!',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            entryFee: 50,
            prizePool: 5000,
            maxTeams: 16,
            registeredTeams: [],
            status: 'upcoming',
            results: {
              winner: null,
              runnerUp: null,
              third: null
            },
            createdAt: new Date().toISOString(),
            slots: {}
          };
          console.log(`[PMSL Sync] Uploading default tournament to Firestore...`);
          setDoc(doc(db, 'tournaments', defaultTournament.id), defaultTournament).catch(err => {
            console.error("Sync error: Failed to upload default tournament:", err);
          });
          this.setCollectionFromFirestore<Tournament>('tournaments', [defaultTournament]);
        }
      } else {
        this.setCollectionFromFirestore<Tournament>('tournaments', firestoreTournaments);
      }
    }, (error) => {
      console.error("Firestore tournaments listener error:", error);
      window.dispatchEvent(new CustomEvent('pmsl-sync-error', { detail: { collection: 'tournaments', error } }));
    });

    // 4. Listen to transactions
    onSnapshot(collection(db, 'transactions'), (snapshot) => {
      const firestoreTransactions: Transaction[] = [];
      snapshot.forEach((doc) => {
        firestoreTransactions.push({ id: doc.id, ...doc.data() } as Transaction);
      });

      if (firestoreTransactions.length === 0) {
        const cached = localStorage.getItem('pmsl_col_transactions');
        let localTxs: Transaction[] = [];
        if (cached) {
          try {
            localTxs = JSON.parse(cached);
          } catch (e) {}
        }
        if (localTxs.length > 0) {
          console.log(`[PMSL Sync] Restoring local transactions to empty Firestore...`);
          localTxs.forEach(t => {
            setDoc(doc(db, 'transactions', t.id), t).catch(err => {
              console.error("Failed to restore transaction:", err);
            });
          });
          this.setCollectionFromFirestore<Transaction>('transactions', localTxs);
          return;
        }
      }
      this.setCollectionFromFirestore<Transaction>('transactions', firestoreTransactions);
    }, (error) => {
      console.error("Firestore transactions listener error:", error);
      window.dispatchEvent(new CustomEvent('pmsl-sync-error', { detail: { collection: 'transactions', error } }));
    });

    // 5. Listen to system_config
    onSnapshot(collection(db, 'system_config'), (snapshot) => {
      const firestoreConfigs: SystemConfig[] = [];
      snapshot.forEach((doc) => {
        firestoreConfigs.push({ id: doc.id, ...doc.data() } as SystemConfig);
      });

      if (firestoreConfigs.length === 0) {
        const defaultConfig = this.getAdsConfig();
        console.log(`[PMSL Sync] Uploading default system config to Firestore...`);
        setDoc(doc(db, 'system_config', defaultConfig.id), defaultConfig).catch(err => {
          console.error("Sync error: Failed to upload default system config:", err);
        });
        this.setCollectionFromFirestore<SystemConfig>('system_config', [defaultConfig]);
      } else {
        this.setCollectionFromFirestore<SystemConfig>('system_config', firestoreConfigs);
      }
    }, (error) => {
      console.error("Firestore system_config listener error:", error);
      window.dispatchEvent(new CustomEvent('pmsl-sync-error', { detail: { collection: 'system_config', error } }));
    });
  }

  // --- System Config / Ad Links ---
  static getAdsConfig(): SystemConfig {
    const configs = this.getCollection<SystemConfig>('system_config');
    const existing = configs.find(c => c.id === 'ads_config');
    if (existing) return existing;
    return {
      id: 'ads_config',
      resultsAdLink: 'https://www.highperformancecpmgate.com/results-ad',
      slotsAdLink: 'https://www.highperformancecpmgate.com/slots-ad',
      earnAdLink: 'https://www.highperformancecpmgate.com/earn-ad',
      loginAdLink: 'https://www.highperformancecpmgate.com/login-ad'
    };
  }

  static saveAdsConfig(config: SystemConfig): void {
    const configs = this.getCollection<SystemConfig>('system_config');
    const index = configs.findIndex(c => c.id === config.id);
    if (index >= 0) {
      configs[index] = config;
    } else {
      configs.push(config);
    }
    this.setCollectionFromFirestore<SystemConfig>('system_config', configs);
    setDoc(doc(db, 'system_config', config.id), config).catch(err => {
      console.error("Firestore saveAdsConfig failed:", err);
    });
  }

  // --- Users Operations ---
  static getUser(uid: string): UserProfile | null {
    const users = this.getCollection<UserProfile>('users');
    const found = users.find(u => u.uid === uid);
    if (found) {
      localStorage.setItem(`pmsl_user_profile_${uid}`, JSON.stringify(found));
      return found;
    }
    const backup = localStorage.getItem(`pmsl_user_profile_${uid}`);
    if (backup) {
      try {
        return JSON.parse(backup);
      } catch (e) {}
    }
    return null;
  }

  static async getUserFromFirestore(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const u = { uid, ...userDoc.data() } as UserProfile;
        localStorage.setItem(`pmsl_user_profile_${uid}`, JSON.stringify(u));
        return u;
      }
    } catch (err) {
      console.error("Error fetching user from Firestore:", err);
    }
    return null;
  }

  static saveUser(user: UserProfile): void {
    const users = this.getCollection<UserProfile>('users');
    const index = users.findIndex(u => u.uid === user.uid);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.setCollectionFromFirestore<UserProfile>('users', users);
    localStorage.setItem(`pmsl_user_profile_${user.uid}`, JSON.stringify(user));

    // Sync to Firestore
    setDoc(doc(db, 'users', user.uid), user).catch(err => {
      console.error("Firestore saveUser failed:", err);
    });
  }

  static getLevel(coinsEarned: number): 'Bronze' | 'Silver' | 'Gold' | 'Diamond' {
    if (coinsEarned <= 100) return 'Bronze';
    if (coinsEarned <= 500) return 'Silver';
    if (coinsEarned <= 1000) return 'Gold';
    return 'Diamond';
  }

  // --- Transactions Operations ---
  static addTransaction(tx: Omit<Transaction, 'id' | 'timestamp'>): void {
    const txs = this.getCollection<Transaction>('transactions');
    const newTxId = 'tx-' + Math.random().toString(36).substring(2, 9);
    const newTx: Transaction = {
      ...tx,
      id: newTxId,
      timestamp: new Date().toISOString()
    };
    txs.push(newTx);
    this.setCollectionFromFirestore<Transaction>('transactions', txs);

    // Sync to Firestore
    setDoc(doc(db, 'transactions', newTxId), newTx).catch(err => {
      console.error("Firestore addTransaction failed:", err);
    });
  }

  // --- Team Operations ---
  static createTeam(name: string, tag: string, captainId: string, logo: string = '🛡️'): Team {
    const teams = this.getCollection<Team>('teams');
    const code = 'TEAM-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const teamId = 'team-' + Math.random().toString(36).substring(2, 9);
    
    const newTeam: Team = {
      id: teamId,
      name,
      tag: tag.toUpperCase(),
      logo,
      captainId,
      members: [captainId],
      inviteCode: code,
      createdAt: new Date().toISOString(),
      totalMatches: 0,
      totalWins: 0
    };

    teams.push(newTeam);
    this.setCollectionFromFirestore<Team>('teams', teams);

    // Sync to Firestore
    setDoc(doc(db, 'teams', teamId), newTeam).catch(err => {
      console.error("Firestore createTeam failed:", err);
    });

    return newTeam;
  }

  static joinTeam(inviteCode: string, userUid: string): Team | string {
    const teams = this.getCollection<Team>('teams');
    const team = teams.find(t => t.inviteCode.toUpperCase() === inviteCode.trim().toUpperCase());
    
    if (!team) {
      return 'Team code invalid. Please check and try again.';
    }
    if (team.members.length >= 5) {
      return 'This team is full. Join another team.';
    }
    if (team.members.includes(userUid)) {
      return "You're already in this team!";
    }

    team.members.push(userUid);
    this.setCollectionFromFirestore<Team>('teams', teams);

    // Sync to Firestore
    setDoc(doc(db, 'teams', team.id), team).catch(err => {
      console.error("Firestore joinTeam failed:", err);
    });

    return team;
  }

  static leaveTeam(teamId: string, userUid: string): void {
    const teams = this.getCollection<Team>('teams');
    const index = teams.findIndex(t => t.id === teamId);
    if (index >= 0) {
      const team = teams[index];
      team.members = team.members.filter(uid => uid !== userUid);
      
      if (team.members.length === 0) {
        teams.splice(index, 1);
        this.setCollectionFromFirestore<Team>('teams', teams);
        // Delete in Firestore
        deleteDoc(doc(db, 'teams', teamId)).catch(err => {
          console.error("Firestore leaveTeam delete failed:", err);
        });
      } else {
        if (team.captainId === userUid) {
          team.captainId = team.members[0];
        }
        this.setCollectionFromFirestore<Team>('teams', teams);
        // Sync in Firestore
        setDoc(doc(db, 'teams', teamId), team).catch(err => {
          console.error("Firestore leaveTeam failed:", err);
        });
      }
    }
  }

  static kickMember(teamId: string, memberUid: string): void {
    const teams = this.getCollection<Team>('teams');
    const index = teams.findIndex(t => t.id === teamId);
    if (index >= 0) {
      const team = teams[index];
      team.members = team.members.filter(uid => uid !== memberUid);
      
      if (team.members.length === 0) {
        teams.splice(index, 1);
        this.setCollectionFromFirestore<Team>('teams', teams);
        deleteDoc(doc(db, 'teams', teamId)).catch(err => {
          console.error("Firestore kickMember delete failed:", err);
        });
      } else {
        this.setCollectionFromFirestore<Team>('teams', teams);
        setDoc(doc(db, 'teams', teamId), team).catch(err => {
          console.error("Firestore kickMember failed:", err);
        });
      }
    }

    // Also update the kicked member's user profile teamId to null
    const users = this.getCollection<UserProfile>('users');
    const userIndex = users.findIndex(u => u.uid === memberUid);
    if (userIndex >= 0) {
      users[userIndex].teamId = null;
      this.setCollectionFromFirestore<UserProfile>('users', users);
      setDoc(doc(db, 'users', memberUid), users[userIndex]).catch(err => {
        console.error("Firestore kickMember user update failed:", err);
      });
    }
  }

  // --- Tournaments Operations ---
  static createTournament(tournament: Omit<Tournament, 'id' | 'registeredTeams' | 'createdAt'>): Tournament {
    const tournaments = this.getCollection<Tournament>('tournaments');
    const tourId = 'tour-' + Math.random().toString(36).substring(2, 9);
    const newTour: Tournament = {
      ...tournament,
      id: tourId,
      registeredTeams: [],
      createdAt: new Date().toISOString()
    };
    tournaments.push(newTour);
    this.setCollectionFromFirestore<Tournament>('tournaments', tournaments);

    // Sync to Firestore
    setDoc(doc(db, 'tournaments', tourId), newTour).catch(err => {
      console.error("Firestore createTournament failed:", err);
    });

    return newTour;
  }

  static registerTeamForTournament(tourId: string, teamId: string): string | null {
    const tours = this.getCollection<Tournament>('tournaments');
    const tour = tours.find(t => t.id === tourId);
    if (!tour) return 'Tournament not found.';
    if (tour.registeredTeams.includes(teamId)) return "You're already registered for this tournament.";
    if (tour.registeredTeams.length >= tour.maxTeams) return 'Tournament registration closed.';

    const teams = this.getCollection<Team>('teams');
    const team = teams.find(t => t.id === teamId);
    if (!team) return 'Team not found.';

    // Check coins of ALL members
    const users = this.getCollection<UserProfile>('users');
    const members = users.filter(u => team.members.includes(u.uid));

    // Check if any member has less coins than entryFee
    const brokeMembers = members.filter(m => m.coins < tour.entryFee);
    if (brokeMembers.length > 0) {
      const brokeNames = brokeMembers.map(m => m.gameName || m.name).join(', ');
      return `Registration failed. The following players do not have enough coins (${tour.entryFee} required): ${brokeNames}. All team players must accumulate enough coins!`;
    }

    // Deduct coins from ALL members and save them
    members.forEach(m => {
      m.coins -= tour.entryFee;
      this.saveUser(m); // This saves and syncs to Firestore!

      // Add a spent transaction
      this.addTransaction({
        userId: m.uid,
        amount: tour.entryFee,
        type: 'spent',
        source: 'tournament_entry',
        description: `Paid ${tour.entryFee} coins entry fee for tournament: ${tour.name}`
      });
    });

    tour.registeredTeams.push(teamId);

    // Auto-allocate slot from slot 4 onwards
    if (!tour.slots) {
      tour.slots = {};
    }
    let assignedSlot = 4;
    while (tour.slots[assignedSlot.toString()]) {
      assignedSlot++;
    }
    tour.slots[assignedSlot.toString()] = teamId;

    this.setCollectionFromFirestore<Tournament>('tournaments', tours);

    // Sync to Firestore
    setDoc(doc(db, 'tournaments', tourId), tour).catch(err => {
      console.error("Firestore registerTeamForTournament failed:", err);
    });

    return null;
  }

  static saveTournament(tour: Tournament): void {
    const tours = this.getCollection<Tournament>('tournaments');
    const index = tours.findIndex(t => t.id === tour.id);
    if (index >= 0) {
      tours[index] = tour;
    } else {
      tours.push(tour);
    }
    this.setCollectionFromFirestore<Tournament>('tournaments', tours);

    // Sync to Firestore
    setDoc(doc(db, 'tournaments', tour.id), tour).catch(err => {
      console.error("Firestore saveTournament failed:", err);
    });
  }

  static deleteTournament(tourId: string): void {
    const tours = this.getCollection<Tournament>('tournaments');
    const filtered = tours.filter(t => t.id !== tourId);
    this.setCollectionFromFirestore<Tournament>('tournaments', filtered);

    // Sync to Firestore
    deleteDoc(doc(db, 'tournaments', tourId)).catch(err => {
      console.error("Firestore deleteTournament failed:", err);
    });
  }

  static deleteTeam(teamId: string): void {
    const teams = this.getCollection<Team>('teams');
    const filtered = teams.filter(t => t.id !== teamId);
    this.setCollectionFromFirestore<Team>('teams', filtered);

    // Sync to Firestore
    deleteDoc(doc(db, 'teams', teamId)).catch(err => {
      console.error("Firestore deleteTeam failed:", err);
    });

    // Reset teamId for all members of this team
    const users = this.getCollection<UserProfile>('users');
    let updatedUsers = false;
    users.forEach(u => {
      if (u.teamId === teamId) {
        u.teamId = null;
        updatedUsers = true;
        setDoc(doc(db, 'users', u.uid), u).catch(err => {
          console.error("Firestore reset user teamId failed:", err);
        });
      }
    });
    if (updatedUsers) {
      this.setCollectionFromFirestore<UserProfile>('users', users);
    }

    // Clean up tournament registrations and slots
    const tournaments = this.getCollection<Tournament>('tournaments');
    let updatedTournaments = false;
    tournaments.forEach(tour => {
      let modified = false;
      if (tour.registeredTeams && tour.registeredTeams.includes(teamId)) {
        tour.registeredTeams = tour.registeredTeams.filter(id => id !== teamId);
        modified = true;
      }
      if (tour.slots) {
        Object.entries(tour.slots).forEach(([slotNum, tid]) => {
          if (tid === teamId) {
            delete tour.slots![slotNum];
            modified = true;
          }
        });
      }
      if (modified) {
        updatedTournaments = true;
        // Sync to Firestore
        setDoc(doc(db, 'tournaments', tour.id), tour).catch(err => {
          console.error("Firestore cleanup team from tournament failed:", err);
        });
      }
    });
    if (updatedTournaments) {
      this.setCollectionFromFirestore<Tournament>('tournaments', tournaments);
    }
  }
}

export const mockDb = {
  collection: (name: string) => ({
    where: () => ({
      get: async () => ({ size: 0, docs: [] })
    }),
    get: async () => ({ docs: [] }),
    add: async () => ({ id: 'mock' })
  })
};

export const mockFirebase = {
  firestore: {
    FieldValue: {
      serverTimestamp: () => ({ mockTimestamp: true })
    }
  }
};
