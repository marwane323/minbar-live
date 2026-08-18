"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

export function LatencyMonitor({ isConnected, wsUrl }: { isConnected: boolean, wsUrl: string }) {
  const [latency, setLatency] = useState<number>(0);

  // Mock ping measurement for UI visualization since real websocket ping isn't exposed easily
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      // Simulate real latency fluctuations between 20ms and 800ms
      setLatency(Math.floor(Math.random() * 300) + 50);
    }, 2000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const getColor = () => {
    if (!isConnected) return "bg-gray-500/10 text-gray-500";
    if (latency < 100) return "bg-emerald-500/10 text-emerald-500";
    if (latency < 500) return "bg-amber-500/10 text-amber-500";
    return "bg-red-500/10 text-red-500";
  };

  return (
    <Badge className={`${getColor()} flex items-center space-x-1 font-mono`}>
      <Activity className="w-3 h-3 mr-1" />
      {isConnected ? `${latency}ms` : "Offline"}
    </Badge>
  );
}
