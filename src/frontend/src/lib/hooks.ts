"use client";

import { useSession as useNextAuthSession } from "next-auth/react";
import { useState, useEffect, useCallback, useRef } from "react";
import { api, ApiError } from "./api";
import { WSConnection, createWSConnection } from "./ws";

/**
 * Typed wrapper around NextAuth's useSession hook.
 */
export function useSession() {
  return useNextAuthSession();
}

/**
 * Hook for fetching data from the API.
 * Pass `null` as path to skip fetching (conditional fetch pattern).
 *
 * @example
 * const { data, error, isLoading, refetch } = useApi<Khutba[]>('/api/khutbas');
 */
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(!!path);

  const fetchData = useCallback(async () => {
    if (!path) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.get<T>(path);
      setData(result);
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError(500, String(e)));
    } finally {
      setIsLoading(false);
    }
  }, [path]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData, setData };
}

/**
 * Hook for mutating data via the API (POST/PUT/DELETE).
 *
 * @example
 * const { mutate, isLoading, error } = useMutation<Khutba>();
 * await mutate(() => api.post('/api/khutbas', { title: 'New' }));
 */
export function useMutation<T>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(async (fn: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
      return result;
    } catch (e) {
      const apiError =
        e instanceof ApiError ? e : new ApiError(500, String(e));
      setError(apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, error, isLoading, mutate };
}

/**
 * Hook for WebSocket connections with auto-connect/disconnect on mount/unmount.
 * Pass `null` as url to skip connecting (conditional connect pattern).
 *
 * @example
 * const { isConnected, on, send } = useWebSocket(`ws://localhost:8006/ws/session/${id}`);
 * useEffect(() => on('transcript_update', (data) => { ... }), [on]);
 */
export function useWebSocket(url: string | null) {
  const wsRef = useRef<WSConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    if (!url) return;

    const ws = createWSConnection(url);
    wsRef.current = ws;

    ws.on("connected", () => {
      setIsConnected(true);
      setReconnecting(false);
    });
    ws.on("disconnected", () => setIsConnected(false));
    ws.on("reconnecting", () => setReconnecting(true));
    ws.on("reconnect_failed", () => setReconnecting(false));

    ws.connect();

    return () => {
      ws.disconnect();
      wsRef.current = null;
      setIsConnected(false);
      setReconnecting(false);
    };
  }, [url]);

  const on = useCallback(
    (event: string, handler: (data: unknown) => void) => {
      return wsRef.current?.on(event, handler) ?? (() => {});
    },
    []
  );

  const send = useCallback((data: unknown) => {
    wsRef.current?.send(data);
  }, []);

  return { isConnected, reconnecting, on, send };
}

/**
 * Hook for polling an API endpoint at a regular interval.
 *
 * @example
 * const { data } = usePolling<TranslationJob>(`/api/translation-jobs/${id}`, 2000);
 */
export function usePolling<T>(
  path: string | null,
  intervalMs: number = 3000
) {
  const { data, error, isLoading, refetch, setData } = useApi<T>(path);

  useEffect(() => {
    if (!path) return;

    const timer = setInterval(() => {
      refetch();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [path, intervalMs, refetch]);

  return { data, error, isLoading, refetch, setData };
}
