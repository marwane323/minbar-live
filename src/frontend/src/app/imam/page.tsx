import { PageShell } from "@/components/layout/page-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Mic } from "lucide-react";

export default function ImamDashboard() {
  return (
    <PageShell 
      title="Imam Portal" 
      description="Manage your Khutbas, sessions, and voice profile."
      actions={
        <div className="flex space-x-2">
          <Link href="/imam/khutba/new">
            <Button className="bg-amber-500 text-black hover:bg-amber-400">
              <Plus className="mr-2 h-4 w-4" /> New Khutba
            </Button>
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#121214] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-100">Recent Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400 text-sm">No recent drafts.</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#121214] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-100">Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400 text-sm">No upcoming sessions.</p>
          </CardContent>
        </Card>

        <Card className="bg-[#121214] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-100">Voice Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 text-amber-500">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-sm font-medium">Action Required</span>
            </div>
            <p className="text-zinc-400 text-sm">Please set up your voice profile to enable live translation.</p>
            <Link href="/imam/voice-setup">
              <Button variant="outline" className="w-full border-zinc-700 text-gray-100 hover:bg-zinc-800">
                <Mic className="mr-2 h-4 w-4" /> Setup Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
