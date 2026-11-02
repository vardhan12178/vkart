import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../axiosInstance";
import { qk } from "../../query/queryKeys";

const EMPTY_ORDERS = [];
const EMPTY_ADDRESSES = [];
const EMPTY_WALLET = { balance: 0, transactions: [] };

// Everything the account page shows, plus `patchUser` for optimistic profile edits.
export default function useProfileData() {
  const queryClient = useQueryClient();

  const profile = useQuery({
    queryKey: qk.profile.root,
    retry: false,
    queryFn: async () => {
      const res = await axios.get("/api/profile");
      return {
        ...res.data,
        twoFactorEnabled: !!res.data.twoFactorEnabled,
        suppress2faPrompt: !!res.data.suppress2faPrompt,
      };
    },
  });

  const orders = useQuery({
    queryKey: qk.profile.orders,
    retry: false,
    queryFn: async () => {
      const res = await axios.get("/api/profile/orders");
      return (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
  });

  const wallet = useQuery({
    queryKey: qk.profile.wallet,
    retry: false,
    queryFn: async () => {
      const res = await axios.get("/api/wallet");
      return {
        balance: Number(res?.data?.balance) || 0,
        transactions: res?.data?.transactions || [],
      };
    },
  });

  const addresses = useQuery({
    queryKey: qk.profile.addresses,
    retry: false,
    queryFn: async () => {
      const res = await axios.get("/api/profile/addresses");
      return res?.data?.addresses || [];
    },
  });

  // Merge changes into the cached profile so every screen sees them at once
  const patchUser = useCallback(
    (changes) => queryClient.setQueryData(qk.profile.root, (u) => ({ ...(u || {}), ...changes })),
    [queryClient]
  );

  const setAddresses = useCallback(
    (next) => queryClient.setQueryData(qk.profile.addresses, next),
    [queryClient]
  );

  return {
    user: profile.data || null,
    orders: orders.data || EMPTY_ORDERS,
    wallet: wallet.data || EMPTY_WALLET,
    addresses: addresses.data || EMPTY_ADDRESSES,
    loading: profile.isLoading || orders.isLoading,
    failed: profile.isError || orders.isError,
    unauthorized: (profile.error || orders.error)?.response?.status === 401,
    patchUser,
    setAddresses,
  };
}
