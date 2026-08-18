"use client";

import { useApi } from "@/lib/hooks";
import { MosqueStats } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Mic, Radio } from "lucide-react";

export function StatsCards() {
  const { data: stats, isLoading } = useApi<MosqueStats>("/api/admin/stats");

  if (isLoading) {
    return <div className="text-gray-400">Loading stats...</div>;
  }

  const defaultStats = {
    total_sessions: 0,
    total_listeners: 0,
    total_khutbas: 0,
    active_imams: 0,
  };

  const displayStats = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Sessions" value={displayStats.total_sessions} icon={Calendar} trend="+12% this month" />
      <StatCard title="Total Listeners" value={displayStats.total_listeners} icon={Radio} trend="+5% this month" />
      <StatCard title="Khutbas Translated" value={displayStats.total_khutbas} icon={Mic} trend="+18% this month" />
      <StatCard title="Active Imams" value={displayStats.active_imams} icon={Users} trend="0% this month" />
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend }: { title: string; value: number | string; icon: any; trend: string }) {
  return (
    <Card className="bg-[#121214] border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
        <Icon className="h-4 w-4 text-amber-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-100">{value}</div>
        <p className="text-xs text-emerald-500 mt-1">{trend}</p>
      </CardContent>
    </Card>
  );
}
