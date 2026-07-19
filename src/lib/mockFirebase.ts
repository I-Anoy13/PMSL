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
      if (snapshot.empty) {
        // Self-healing: If Firestore is empty but we have local users, upload them to Firestore!
        const localUsers = this.getCollection<UserProfile>('users');
        if (localUsers.length > 0) {
          console.log(`[PMSL Self-Healing] Firestore 'users' is empty. Uploading ${localUsers.length} local users...`);
          localUsers.forEach(user => {
            setDoc(doc(db, 'users', user.uid), user).catch(err => {
              console.error("Self-healing: Error uploading user to Firestore:", err);
            });
          });
          return;
        }
      }
      const users: UserProfile[] = [];
      snapshot.forEach((doc) => {
        users.push({ uid: doc.id, ...doc.data() } as UserProfile);
      });
      this.setCollectionFromFirestore<UserProfile>('users', users);
    }, (error) => {
      console.error("Firestore users listener error:", error);
    });

    // 2. Listen to teams
    onSnapshot(collection(db, 'teams'), (snapshot) => {
      if (snapshot.empty) {
        // Self-healing: If Firestore is empty but we have local teams, upload them to Firestore!
        const localTeams = this.getCollection<Team>('teams');
        if (localTeams.length > 0) {
          console.log(`[PMSL Self-Healing] Firestore 'teams' is empty. Uploading ${localTeams.length} local teams...`);
          localTeams.forEach(team => {
            setDoc(doc(db, 'teams', team.id), team).catch(err => {
              console.error("Self-healing: Error uploading team to Firestore:", err);
            });
          });
          return;
        }
      }
      const teams: Team[] = [];
      snapshot.forEach((doc) => {
        teams.push({ id: doc.id, ...doc.data() } as Team);
      });
      this.setCollectionFromFirestore<Team>('teams', teams);
    }, (error) => {
      console.error("Firestore teams listener error:", error);
    });

    // 3. Listen to tournaments
    onSnapshot(collection(db, 'tournaments'), (snapshot) => {
      if (snapshot.empty) {
        // Self-healing: If Firestore is empty but we have local tournaments, upload them to Firestore!
        const localTournaments = this.getCollection<Tournament>('tournaments');
        if (localTournaments.length > 0) {
          console.log(`[PMSL Self-Healing] Firestore 'tournaments' is empty. Uploading ${localTournaments.length} local tournaments...`);
          localTournaments.forEach(tour => {
            setDoc(doc(db, 'tournaments', tour.id), tour).catch(err => {
              console.error("Self-healing: Error uploading tournament to Firestore:", err);
            });
          });
          return;
        }
      }
      const tournaments: Tournament[] = [];
      snapshot.forEach((doc) => {
        tournaments.push({ id: doc.id, ...doc.data() } as Tournament);
      });
      this.setCollectionFromFirestore<Tournament>('tournaments', tournaments);
    }, (error) => {
      console.error("Firestore tournaments listener error:", error);
    });

    // 4. Listen to transactions
    onSnapshot(collection(db, 'transactions'), (snapshot) => {
      if (snapshot.empty) {
        // Self-healing: If Firestore is empty but we have local transactions, upload them to Firestore!
        const localTransactions = this.getCollection<Transaction>('transactions');
        if (localTransactions.length > 0) {
          console.log(`[PMSL Self-Healing] Firestore 'transactions' is empty. Uploading ${localTransactions.length} local transactions...`);
          localTransactions.forEach(tx => {
            setDoc(doc(db, 'transactions', tx.id), tx).catch(err => {
              console.error("Self-healing: Error uploading transaction to Firestore:", err);
            });
          });
          return;
        }
      }
      const transactions: Transaction[] = [];
      snapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      this.setCollectionFromFirestore<Transaction>('transactions', transactions);
    }, (error) => {
      console.error("Firestore transactions listener error:", error);
    });

    // 5. Listen to system_config
    onSnapshot(collection(db, 'system_config'), (snapshot) => {
      if (snapshot.empty) {
        // Self-healing: If Firestore is empty but we have local system_config, upload them to Firestore!
        const localConfigs = this.getCollection<SystemConfig>('system_config');
        if (localConfigs.length > 0) {
          console.log(`[PMSL Self-Healing] Firestore 'system_config' is empty. Uploading ${localConfigs.length} local configs...`);
          localConfigs.forEach(config => {
            setDoc(doc(db, 'system_config', config.id), config).catch(err => {
              console.error("Self-healing: Error uploading config to Firestore:", err);
            });
          });
          return;
        } else {
          // Sync default configuration to Firestore so it is saved online
          const defaultConfig = this.getAdsConfig();
          console.log(`[PMSL Self-Healing] Firestore 'system_config' is empty. Pre-seeding default configuration...`);
          setDoc(doc(db, 'system_config', defaultConfig.id), defaultConfig).catch(err => {
            console.error("Self-healing: Error uploading default config to Firestore:", err);
          });
          return;
        }
      }
      const configs: SystemConfig[] = [];
      snapshot.forEach((doc) => {
        configs.push({ id: doc.id, ...doc.data() } as SystemConfig);
      });
      this.setCollectionFromFirestore<SystemConfig>('system_config', configs);
    }, (error) => {
      console.error("Firestore system_config listener error:", error);
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
    return users.find(u => u.uid === uid) || null;
  }

  static async getUserFromFirestore(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { uid, ...userDoc.data() } as UserProfile;
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
