"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useApi, useMutation } from "@/lib/hooks";
import { api } from "@/lib/api";
import { Session, Khutba } from "@/lib/types";

export default function SessionsPage() {
  const { data: sessions, refetch } = useApi<Session[]>('/api/sessions');
  const { data: khutbas } = useApi<Khutba[]>('/api/khutbas');
  const { mutate, isLoading } = useMutation<Session>();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [khutbaId, setKhutbaId] = useState("");

  const handleCreateSession = async () => {
    await mutate(() => api.post('/api/sessions', { title, khutba_id: khutbaId }));
    setIsDialogOpen(false);
    refetch();
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "live": return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Live</Badge>;
      case "preparing": return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Preparing</Badge>;
      case "ended": return <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700">Ended</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <PageShell 
      title="Sessions"
      description="Manage your live translation sessions."
      actions={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 text-black hover:bg-amber-400">
              <Plus className="mr-2 h-4 w-4" /> New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#121214] border-zinc-800 text-gray-100">
            <DialogHeader>
              <DialogTitle>Create Live Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Session Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-zinc-900 border-zinc-800" />
              </div>
              <div className="space-y-2">
                <Label>Select Khutba</Label>
                <Select value={khutbaId} onValueChange={setKhutbaId}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800">
                    <SelectValue placeholder="Select a prepared khutba" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {khutbas?.filter(k => k.status === 'ready').map(k => (
                      <SelectItem key={k.id} value={k.id} className="text-gray-100">{k.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateSession} disabled={!title || !khutbaId || isLoading} className="bg-amber-500 text-black hover:bg-amber-400">
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="bg-[#121214] border border-zinc-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400">Title</TableHead>
              <TableHead className="text-zinc-400">Khutba</TableHead>
              <TableHead className="text-zinc-400">Date</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Languages</TableHead>
              <TableHead className="text-zinc-400 text-right">Listeners</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions?.length === 0 && (
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableCell colSpan={6} className="text-center text-zinc-500 py-8">No sessions found.</TableCell>
              </TableRow>
            )}
            {sessions?.map((session) => (
              <TableRow key={session.id} className="border-zinc-800 hover:bg-zinc-800/50">
                <TableCell className="font-medium text-gray-100">{session.title}</TableCell>
                <TableCell className="text-zinc-400">{session.khutba_title}</TableCell>
                <TableCell className="text-zinc-400">{new Date(session.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{getStatusBadge(session.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {session.languages.map(lang => (
                      <Badge key={lang} variant="outline" className="text-xs border-zinc-700 text-zinc-300 bg-zinc-800/50">
                        {lang.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right text-zinc-400">{session.listener_count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageShell>
  );
}
