"use client";

import { useCallback, useEffect, useState } from "react";

import type { Transaction } from "@/lib/data";
import { getBrowserAccessToken } from "@/lib/supabase/browser-session";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CreateTransactionInput, UpdateTransactionInput } from "@/lib/transaction-contracts";

interface TransactionsResponse {
  transactions: Transaction[];
}

interface TransactionResponse {
  transaction: Transaction;
}

interface ResolveResponse {
  ticketId: string | null;
}

async function readJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data === "object" && data && "error" in data && typeof data.error === "string"
        ? data.error
        : "Request failed.";
    throw new Error(message);
  }
  return data as T;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const accessToken = await getBrowserAccessToken();
  if (!accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch("/api/transactions", {
        cache: "no-store",
        headers,
      });
      const data = await readJson<TransactionsResponse>(response);
      setTransactions(data.transactions);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load transactions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return undefined;
    }

    const channel = supabase
      .channel("laundrytrack-transactions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
        },
        () => {
          void refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const createTransaction = useCallback(async (input: CreateTransactionInput) => {
    const headers = await getAuthHeaders();
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(input),
    });

    const data = await readJson<TransactionResponse>(response);
    setTransactions((current) => [data.transaction, ...current]);
    return data.transaction;
  }, []);

  const updateTransaction = useCallback(async (ticketId: string, updates: UpdateTransactionInput) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/transactions/${encodeURIComponent(ticketId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(updates),
    });

    const data = await readJson<TransactionResponse>(response);
    setTransactions((current) =>
      current.map((transaction) =>
        transaction.ticketId === data.transaction.ticketId ? data.transaction : transaction,
      ),
    );
    return data.transaction;
  }, []);

  const resolveScannedValue = useCallback(async (value: string) => {
    const response = await fetch("/api/qr/resolve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value }),
    });

    const data = await readJson<ResolveResponse>(response);
    return data.ticketId;
  }, []);

  return {
    transactions,
    loading,
    error,
    refresh,
    createTransaction,
    updateTransaction,
    resolveScannedValue,
  };
}
