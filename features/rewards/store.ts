import { create } from "zustand";
import {
  RewardsConfig,
  RewardBalance,
  Referral,
  RedemptionRecord,
  ReferralStats,
  RewardsAction,
  RewardsError,
} from "./types";

import {
  mockRewardsConfig,
  mockRewardBalances,
  mockReferrals,
  mockRedemptions,
  mockReferralStats,
} from "./data/rewards";

interface RewardsStore {
  // State properties
  config: RewardsConfig | null;
  balance: RewardBalance | null;
  referrals: Referral[];
  redemptions: RedemptionRecord[];
  referralStats: ReferralStats | null;
  loading: boolean;
  storeError: RewardsError | null;
  activeAction: string | null;

  // State setters
  setActiveAction: (action: string | null) => void;
  setLoading: (loading: boolean) => void;
  setStoreError: (error: RewardsError | null) => void;
  setConfig: (config: RewardsConfig | null) => void;
  setBalance: (balance: RewardBalance | null) => void;
  setReferrals: (referrals: Referral[]) => void;
  setRedemptions: (redemptions: RedemptionRecord[]) => void;
  setReferralStats: (stats: ReferralStats | null) => void;

  // Rewards API methods
  fetchConfig: () => Promise<RewardsConfig>;
  updateConfig: (data: RewardsConfig) => Promise<RewardsConfig>;
  fetchBalance: (userId: string) => Promise<RewardBalance>;
  fetchReferrals: () => Promise<Referral[]>;
  fetchReferralStats: () => Promise<ReferralStats>;
  fetchRedemptions: () => Promise<RedemptionRecord[]>;
}

export const useRewardsStore = create<RewardsStore>()((set, get) => ({
  // Initial state
  config: null,
  balance: null,
  referrals: [],
  redemptions: [],
  referralStats: null,
  loading: false,
  storeError: null,
  activeAction: null,

  // State setters
  setActiveAction: (action) => set({ activeAction: action }),
  setLoading: (loading) => set({ loading }),
  setStoreError: (error) => set({ storeError: error }),
  setConfig: (config) => set({ config }),
  setBalance: (balance) => set({ balance }),
  setReferrals: (referrals) => set({ referrals }),
  setRedemptions: (redemptions) => set({ redemptions }),
  setReferralStats: (stats) => set({ referralStats: stats }),

  // Rewards API methods
  fetchConfig: async () => {
    const { setActiveAction, setLoading, setStoreError, setConfig } = get();
    try {
      setActiveAction("fetchConfig");
      setLoading(true);

      // Mock API call - in a real app, this would be an API request
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Use mock data
      const configData = mockRewardsConfig;

      setConfig(configData);
      setLoading(false);
      return configData;
    } catch (error: unknown) {
      console.error("Error fetching rewards config:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch rewards config";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  updateConfig: async (data: RewardsConfig) => {
    const { setActiveAction, setLoading, setStoreError, setConfig } = get();
    try {
      setActiveAction("updateConfig");
      setLoading(true);

      // Mock API call - in a real app, this would be an API request
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Update mock data
      const updatedConfig = {
        ...data,
      };

      setConfig(updatedConfig);
      setLoading(false);
      return updatedConfig;
    } catch (error: unknown) {
      console.error("Error updating rewards config:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update rewards config";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  fetchBalance: async (userId: string) => {
    const { setActiveAction, setLoading, setStoreError, setBalance } = get();
    try {
      setActiveAction("fetchBalance");
      setLoading(true);

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Find the user's balance in mock data
      const balanceData = mockRewardBalances.find(b => b.userId === userId) || mockRewardBalances[0];

      setBalance(balanceData);
      setLoading(false);
      return balanceData;
    } catch (error: unknown) {
      console.error("Error fetching reward balance:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch reward balance";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  fetchReferrals: async () => {
    const { setActiveAction, setLoading, setStoreError, setReferrals } = get();
    try {
      setActiveAction("fetchReferrals");
      setLoading(true);

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Use mock data
      const referralsData = mockReferrals;

      setReferrals(referralsData);
      setLoading(false);
      return referralsData;
    } catch (error: unknown) {
      console.error("Error fetching referrals:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch referrals";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  fetchReferralStats: async () => {
    const { setActiveAction, setLoading, setStoreError, setReferralStats } = get();
    try {
      setActiveAction("fetchReferralStats");
      setLoading(true);

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Use mock data
      const statsData = mockReferralStats;

      setReferralStats(statsData);
      setLoading(false);
      return statsData;
    } catch (error: unknown) {
      console.error("Error fetching referral stats:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch referral stats";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  fetchRedemptions: async () => {
    const { setActiveAction, setLoading, setStoreError, setRedemptions } = get();
    try {
      setActiveAction("fetchRedemptions");
      setLoading(true);

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Use mock data
      const redemptionsData = mockRedemptions;

      setRedemptions(redemptionsData);
      setLoading(false);
      return redemptionsData;
    } catch (error: unknown) {
      console.error("Error fetching redemptions:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch redemptions";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },
}));
