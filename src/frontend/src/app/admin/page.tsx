"use client";

import { PageShell } from "@/components/layout/page-shell";
import { StatsCards } from "@/components/admin/stats-cards";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SessionsChart } from "@/components/admin/sessions-chart";
import { RecentActivityList } from "@/components/admin/recent-activity";

export default function AdminDashboardPage() {
  return (
    <PageShell 
      title="Admin Dashboard" 
      description="Overview of your mosque's Minbar Live usage and statistics."
    >
      <div className="space-y-6">
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#121214] border-zinc-800">
            <CardHeader>
              <CardTitle className="text-gray-100">Sessions Over Time</CardTitle>
              <CardDescription className="text-gray-400">Monthly breakdown of Khutba sessions.</CardDescription>
            </CardHeader>
            <CardContent>
              <SessionsChart />
            </CardContent>
          </Card>

          <Card className="bg-[#121214] border-zinc-800">
            <CardHeader>
              <CardTitle className="text-gray-100">Recent Activity</CardTitle>
              <CardDescription className="text-gray-400">Audit log of system actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivityList />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
