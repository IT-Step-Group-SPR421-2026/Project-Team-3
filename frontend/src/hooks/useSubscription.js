import { useState, useCallback } from "react";
import { apiFetch } from "../utils/api";

/**
 * Custom hook to manage subscription
 * Handles checking status, registering purchases with transaction hash verification
 */
export function useSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch("/subscriptions/status/");
      setSubscription(data);
      return data;
    } catch (err) {
      const message = err.message || "Failed to fetch subscription status";
      setError(message);
      console.error("Subscription fetch error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const canCreateHabit = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/subscriptions/can-create-habit/");
      return data;
    } catch (err) {
      console.error("Can create habit check error:", err);
      return {
        can_create: false,
        reason: "Error checking subscription",
        current_habits: 0,
        free_tier_limit: 5,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const registerSubscription = useCallback(
    async (walletAddress, txHash) => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch("/subscriptions/register/", {
          method: "POST",
          body: JSON.stringify({
            wallet_address: walletAddress,
            tx_hash: txHash,
          }),
        });
        setSubscription(data);
        return data;
      } catch (err) {
        const message = err.message || "Failed to register subscription";
        setError(message);
        console.error("Subscription registration error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getSubscriptionInfo = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/subscriptions/info/");
      return data;
    } catch (err) {
      console.error("Subscription info error:", err);
      return {
        free_tier_limit: 5,
        price: "0.1",
        contract_address: "",
        contract_network: "polygon",
        purchase_type: "one-time",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const isActive = subscription && subscription.is_active;
  const isPremium = isActive;

  return {
    subscription,
    loading,
    error,
    fetchStatus,
    canCreateHabit,
    registerSubscription,
    getSubscriptionInfo,
    isActive,
    isPremium,
  };
}

/**
 * Hook to manage blockchain wallet connection (MetaMask, etc.)
 * Usage:
 *   const { connectWallet, account, isConnected } = useWallet();
 */
export function useWallet() {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        return accounts[0];
      }
    } catch (err) {
      const message = err.message || "Failed to connect wallet";
      setError(message);
      console.error("Wallet connection error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setError(null);
  };

  // Check if wallet is already connected on mount
  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      }
    } catch (err) {
      console.error("Error checking wallet connection:", err);
    }
  };

  return {
    account,
    isConnected,
    error,
    loading,
    connectWallet,
    disconnectWallet,
    checkConnection,
  };
}
