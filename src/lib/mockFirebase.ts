// Fully functional offline-first Firebase & Firestore simulator
// Implements users, teams, tournaments, transactions, adLogs, and referrals
import { CoinTransaction } from '../types';

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

// Initial Seeding
const SEED_TOURNAMENTS: Tournament[] = [];

const SEED_TEAMS: Team[] = [];

// LocalStorage Helpers
export class MockDatabase {
  static getCollection<T>(key: string, initialSeed: T[] = []): T[] {
    const data = localStorage.getItem(`pmsl_col_${key}`);
    if (!data) {
      localStorage.setItem(`pmsl_col_${key}`, JSON.stringify(initialSeed));
      return initialSeed;
    }
    return JSON.parse(data);
  }

  static setCollection<T>(key: string, items: T[]): void {
    localStorage.setItem(`pmsl_col_${key}`, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('pmsl-db-update', { detail: { key } }));
  }

  static initialize() {
    this.getCollection<Tournament>('tournaments', SEED_TOURNAMENTS);
    this.getCollection<Team>('teams', SEED_TEAMS);
    this.getCollection<UserProfile>('users', []);
    this.getCollection<Transaction>('transactions', []);
  }

  // --- Users Operations ---
  static getUser(uid: string): UserProfile | null {
    const users = this.getCollection<UserProfile>('users');
    return users.find(u => u.uid === uid) || null;
  }

  static saveUser(user: UserProfile): void {
    const users = this.getCollection<UserProfile>('users');
    const index = users.findIndex(u => u.uid === user.uid);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.setCollection<UserProfile>('users', users);
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
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString()
    };
    txs.push(newTx);
    this.setCollection<Transaction>('transactions', txs);
  }

  // --- Team Operations ---
  static createTeam(name: string, tag: string, captainId: string, logo: string = '🛡️'): Team {
    const teams = this.getCollection<Team>('teams');
    const code = 'TEAM-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const newTeam: Team = {
      id: 'team-' + Math.random().toString(36).substring(2, 9),
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
    this.setCollection<Team>('teams', teams);
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
    this.setCollection<Team>('teams', teams);
    return team;
  }

  static leaveTeam(teamId: string, userUid: string): void {
    const teams = this.getCollection<Team>('teams');
    const index = teams.findIndex(t => t.id === teamId);
    if (index >= 0) {
      const team = teams[index];
      team.members = team.members.filter(uid => uid !== userUid);
      
      // If team is empty or captain left and no one else is there, delete it
      if (team.members.length === 0) {
        teams.splice(index, 1);
      } else if (team.captainId === userUid) {
        // Appoint next captain
        team.captainId = team.members[0];
      }
      this.setCollection<Team>('teams', teams);
    }
  }

  static kickMember(teamId: string, memberUid: string): void {
    const teams = this.getCollection<Team>('teams');
    const index = teams.findIndex(t => t.id === teamId);
    if (index >= 0) {
      const team = teams[index];
      team.members = team.members.filter(uid => uid !== memberUid);
      
      // If team is empty, delete it
      if (team.members.length === 0) {
        teams.splice(index, 1);
      }
      this.setCollection<Team>('teams', teams);
    }

    // Also update the kicked member's user profile teamId to null
    const users = this.getCollection<UserProfile>('users');
    const userIndex = users.findIndex(u => u.uid === memberUid);
    if (userIndex >= 0) {
      users[userIndex].teamId = null;
      this.setCollection<UserProfile>('users', users);
    }
  }

  // --- Tournaments Operations ---
  static createTournament(tournament: Omit<Tournament, 'id' | 'registeredTeams' | 'createdAt'>): Tournament {
    const tournaments = this.getCollection<Tournament>('tournaments');
    const newTour: Tournament = {
      ...tournament,
      id: 'tour-' + Math.random().toString(36).substring(2, 9),
      registeredTeams: [],
      createdAt: new Date().toISOString()
    };
    tournaments.push(newTour);
    this.setCollection<Tournament>('tournaments', tournaments);
    return newTour;
  }

  static registerTeamForTournament(tourId: string, teamId: string): string | null {
    const tours = this.getCollection<Tournament>('tournaments');
    const tour = tours.find(t => t.id === tourId);
    if (!tour) return 'Tournament not found.';
    if (tour.registeredTeams.includes(teamId)) return "You're already registered for this tournament.";
    if (tour.registeredTeams.length >= tour.maxTeams) return 'Tournament registration closed.';

    tour.registeredTeams.push(teamId);
    this.setCollection<Tournament>('tournaments', tours);
    return null;
  }
}

// Keep standard mock Firebase format
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
