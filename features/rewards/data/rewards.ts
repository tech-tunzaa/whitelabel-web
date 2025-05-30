import { 
  RewardsConfig, 
  RewardBalance, 
  Referral, 
  RedemptionRecord,
  ReferralStats
} from '../types';

export const mockRewardsConfig: RewardsConfig = {
  pointsPerTzs: 100, // 1 point per TZS 100
  redemption: {
    points: 100,
    value: 500, // TZS 500 discount coupon for 100 points
  },
  referralBonus: 50, // 50 points for successful referral
};

export const mockRewardBalances: RewardBalance[] = [
  {
    userId: 'user1',
    balance: 450,
    history: [
      {
        id: 'hist1',
        userId: 'user1',
        type: 'purchase',
        points: 50,
        orderId: 'ord123',
        description: 'Points earned from order #12345',
        date: '2025-05-25T14:30:00Z',
      },
      {
        id: 'hist2',
        userId: 'user1',
        type: 'referral',
        points: 50,
        description: 'Referral bonus for John Doe',
        date: '2025-05-20T10:15:00Z',
      },
      {
        id: 'hist3',
        userId: 'user1',
        type: 'redemption',
        points: -100,
        description: 'Redeemed points for TZS 500 discount',
        date: '2025-05-15T09:00:00Z',
      },
      {
        id: 'hist4',
        userId: 'user1',
        type: 'purchase',
        points: 200,
        orderId: 'ord100',
        description: 'Points earned from order #10000',
        date: '2025-05-10T16:45:00Z',
      },
      {
        id: 'hist5',
        userId: 'user1',
        type: 'bonus',
        points: 250,
        description: 'Welcome bonus',
        date: '2025-05-01T13:20:00Z',
      },
    ],
  },
  {
    userId: 'user2',
    balance: 300,
    history: [
      {
        id: 'hist6',
        userId: 'user2',
        type: 'purchase',
        points: 150,
        orderId: 'ord200',
        description: 'Points earned from order #20000',
        date: '2025-05-27T11:30:00Z',
      },
      {
        id: 'hist7',
        userId: 'user2',
        type: 'bonus',
        points: 150,
        description: 'Welcome bonus',
        date: '2025-05-22T09:15:00Z',
      },
    ],
  },
];

export const mockReferrals: Referral[] = [
  {
    id: 'ref1',
    referrerId: 'user1',
    referrerName: 'Alice Johnson',
    refereeId: 'user3',
    refereeName: 'Bob Smith',
    code: 'ALICE123',
    status: 'completed',
    pointsCredited: true,
    createdAt: '2025-05-15T10:00:00Z',
    completedAt: '2025-05-17T15:30:00Z',
  },
  {
    id: 'ref2',
    referrerId: 'user1',
    referrerName: 'Alice Johnson',
    refereeId: 'user4',
    refereeName: 'Carol Davis',
    code: 'ALICE123',
    status: 'completed',
    pointsCredited: true,
    createdAt: '2025-05-18T09:45:00Z',
    completedAt: '2025-05-20T12:15:00Z',
  },
  {
    id: 'ref3',
    referrerId: 'user2',
    referrerName: 'David Wilson',
    refereeId: 'user5',
    refereeName: 'Eva Brown',
    code: 'DAVID456',
    status: 'pending',
    pointsCredited: false,
    createdAt: '2025-05-25T14:20:00Z',
  },
  {
    id: 'ref4',
    referrerId: 'user1',
    referrerName: 'Alice Johnson',
    refereeId: 'user6',
    refereeName: 'Frank Miller',
    code: 'ALICE123',
    status: 'pending',
    pointsCredited: false,
    createdAt: '2025-05-28T11:10:00Z',
  },
  {
    id: 'ref5',
    referrerId: 'user2',
    referrerName: 'David Wilson',
    refereeId: 'user7',
    refereeName: 'Grace Taylor',
    code: 'DAVID456',
    status: 'completed',
    pointsCredited: true,
    createdAt: '2025-05-10T16:30:00Z',
    completedAt: '2025-05-12T09:20:00Z',
  },
];

export const mockRedemptions: RedemptionRecord[] = [
  {
    id: 'redeem1',
    userId: 'user1',
    userName: 'Alice Johnson',
    points: 100,
    value: 500,
    couponCode: 'DISC500-123',
    status: 'used',
    createdAt: '2025-05-15T09:00:00Z',
    usedAt: '2025-05-16T14:30:00Z',
    orderId: 'ord150',
  },
  {
    id: 'redeem2',
    userId: 'user2',
    userName: 'David Wilson',
    points: 100,
    value: 500,
    couponCode: 'DISC500-456',
    status: 'active',
    createdAt: '2025-05-20T11:15:00Z',
  },
  {
    id: 'redeem3',
    userId: 'user3',
    userName: 'Bob Smith',
    points: 100,
    value: 500,
    couponCode: 'DISC500-789',
    status: 'used',
    createdAt: '2025-05-10T10:30:00Z',
    usedAt: '2025-05-11T16:45:00Z',
    orderId: 'ord175',
  },
  {
    id: 'redeem4',
    userId: 'user4',
    userName: 'Carol Davis',
    points: 100,
    value: 500,
    couponCode: 'DISC500-012',
    status: 'expired',
    createdAt: '2025-04-25T13:20:00Z',
  },
  {
    id: 'redeem5',
    userId: 'user1',
    userName: 'Alice Johnson',
    points: 100,
    value: 500,
    couponCode: 'DISC500-345',
    status: 'active',
    createdAt: '2025-05-25T15:40:00Z',
  },
];

export const mockReferralStats: ReferralStats = {
  totalReferrals: 5,
  pendingReferrals: 2,
  completedReferrals: 3,
  totalBonusPoints: 150,
  topReferrers: [
    {
      userId: 'user1',
      userName: 'Alice Johnson',
      referralsCount: 3,
      pointsEarned: 100,
    },
    {
      userId: 'user2',
      userName: 'David Wilson',
      referralsCount: 2,
      pointsEarned: 50,
    },
  ],
};
