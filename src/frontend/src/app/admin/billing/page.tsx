import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

export default function AdminBillingPage() {
  return (
    <PageShell 
      title="Billing & Subscription" 
      description="Manage your subscription plan and payment methods."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Current Plan */}
        <Card className="bg-[#121214] border-zinc-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center justify-between">
              <span>Current Plan</span>
              <span className="text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-full text-sm">Professional</span>
            </CardTitle>
            <CardDescription className="text-gray-400">Your plan renews on Oct 1st, 2024.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Translation Minutes</span>
                <span className="text-gray-200">1,200 / 2,000 mins</span>
              </div>
              <Progress value={60} className="bg-zinc-800 h-2" indicatorColor="bg-amber-500" />
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-200">Plan Features:</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-500" /> Up to 5 Active Imams</li>
                <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-500" /> 10 Concurrent Languages</li>
                <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-500" /> Custom Vocabulary & Branding</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="border-t border-zinc-800 pt-6">
            <Button className="bg-amber-500 text-black hover:bg-amber-400 mr-4">
              Upgrade Plan
            </Button>
            <Button variant="outline" className="border-zinc-700 text-gray-300 hover:text-white hover:bg-zinc-800">
              Manage Subscription (Stripe)
            </Button>
          </CardFooter>
        </Card>

        {/* Payment Method / Invoices placeholder */}
        <div className="space-y-6">
          <Card className="bg-[#121214] border-zinc-800">
            <CardHeader>
              <CardTitle className="text-gray-100 text-lg">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center p-3 border border-zinc-800 rounded-md bg-[#1a1a1e]">
                <div className="w-10 h-6 bg-zinc-800 rounded mr-3 flex items-center justify-center text-xs font-bold text-gray-500">VISA</div>
                <div>
                  <div className="text-sm text-gray-200">•••• •••• •••• 4242</div>
                  <div className="text-xs text-gray-500">Expires 12/25</div>
                </div>
              </div>
              <Button variant="link" className="text-amber-500 px-0 mt-2">Update payment method</Button>
            </CardContent>
          </Card>

          <Card className="bg-[#121214] border-zinc-800">
            <CardHeader>
              <CardTitle className="text-gray-100 text-lg">Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: "INV-001", date: "Sep 1, 2024", amount: "$99.00" },
                { id: "INV-002", date: "Aug 1, 2024", amount: "$99.00" },
              ].map(inv => (
                <div key={inv.id} className="flex justify-between items-center text-sm border-b border-zinc-800 pb-2 last:border-0 last:pb-0">
                  <div>
                    <div className="text-gray-200">{inv.amount}</div>
                    <div className="text-gray-500 text-xs">{inv.date}</div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-amber-500 h-8">PDF</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </PageShell>
  );
}
