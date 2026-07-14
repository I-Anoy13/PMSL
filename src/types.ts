export interface CoinTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'spent';
  source: 'ad_watch' | 'daily_reward' | 'purchase';
  description: string;
  timestamp: string;
}

export interface AdWatchHistory {
  id: string;
  userId: string;
  timestamp: string;
  adType: 'rewarded';
  coinsEarned: number;
}

export type AdStatus = 'IDLE' | 'LOADING' | 'PLAYING' | 'COMPLETED' | 'FAILED';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}
