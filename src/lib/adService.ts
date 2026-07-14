import { AdStatus } from '../types';

export class RewardedAd {
  private closedCallback?: () => Promise<void> | void;
  private failedCallback?: () => void;
  
  public static currentInstance: RewardedAd | null = null;
  public static onStateChange?: (status: AdStatus) => void;
  public static failProbability: number = 0; // 0 to 100%

  constructor() {
    RewardedAd.currentInstance = this;
  }

  loadAd() {
    if (RewardedAd.onStateChange) {
      RewardedAd.onStateChange('LOADING');
    }
    
    // Simulate loading latency
    setTimeout(() => {
      // Determine if ad loading fails based on testing probability
      const shouldFail = Math.random() * 100 < RewardedAd.failProbability;
      
      if (shouldFail) {
        if (RewardedAd.onStateChange) {
          RewardedAd.onStateChange('FAILED');
        }
        if (this.failedCallback) {
          this.failedCallback();
        }
      } else {
        if (RewardedAd.onStateChange) {
          RewardedAd.onStateChange('IDLE'); // loaded and ready
        }
      }
    }, 1000);
  }

  showAd() {
    if (RewardedAd.onStateChange) {
      RewardedAd.onStateChange('PLAYING');
    }
  }

  onAdClosed(callback: () => Promise<void> | void) {
    this.closedCallback = callback;
  }

  onAdFailed(callback: () => void) {
    this.failedCallback = callback;
  }

  // Triggered by the UI Ad player simulation
  public triggerClose() {
    if (RewardedAd.onStateChange) {
      RewardedAd.onStateChange('COMPLETED');
    }
    if (this.closedCallback) {
      this.closedCallback();
    }
    RewardedAd.currentInstance = null;
  }

  public triggerFail() {
    if (RewardedAd.onStateChange) {
      RewardedAd.onStateChange('FAILED');
    }
    if (this.failedCallback) {
      this.failedCallback();
    }
    RewardedAd.currentInstance = null;
  }
}
