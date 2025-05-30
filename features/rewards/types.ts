export interface RewardsConfig {
  pointsPerTzs: number;
  redemption: {
    points: number;
    value: number;
  };
  referralBonus: number;
}

export type RewardType = 'purchase' | 'redemption' | 'referral' | 'bonus';

export interface RewardHistory {
  id: string;
  userId: string;
  type: RewardType;
  points: number;
  orderId?: string;
  description: string;
  date: string;
}

export interface RewardBalance {
  userId: string;
  balance: number;
  history: RewardHistory[];
}

export interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  refereeId: string;
  refereeName: string;
  code: string;
  status: 'pending' | 'completed';
  pointsCredited: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface RedemptionRecord {
  id: string;
  userId: string;
  userName: string;
  points: number;
  value: number;
  couponCode: string;
  status: 'active' | 'used' | 'expired';
  createdAt: string;
  usedAt?: string;
  orderId?: string;
}

export interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalBonusPoints: number;
  topReferrers: {
    userId: string;
    userName: string;
    referralsCount: number;
    pointsEarned: number;
  }[];
}

export interface RewardsAction {
  type: 
    | 'fetchConfig'
    | 'updateConfig'
    | 'fetchBalance'
    | 'fetchReferrals'
    | 'fetchReferralStats'
    | 'fetchRedemptions';
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
}

export interface RewardsError {
  message: string;
  status?: number;
}
