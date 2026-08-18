"use client";

import { useState } from "react";
import { useApi, useMutation } from "@/lib/hooks";
import { Session, Khutba, SUPPORTED_LANGUAGES } from "@/lib/types";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Play } from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function SessionListPage() {
  const { data: sessions, isLoading, refetch } = useApi<Session[]>("/api/sessions");
  const { data: khutbas } = useApi<Khutba[]>("/api/khutbas");
  
  const { mutate, isLoading: isCreating } = useMutation<Session>();
  
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedKhutba, setSelectedKhutba] = useState("");
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);

  const handleCreate = async () => {
    await mutate(() => api.post("/api/sessions", {
      title,
      khutba_id: selectedKhutba,
      languages: selectedLangs
    }));
    setOpen(false);
    refetch();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live": return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Live</Badge>;
      case "paused": return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">Paused</Badge>;
      case "ended": return <Badge className="bg-zinc-800 text-gray-400 hover:bg-zinc-700">Ended</Badge>;
      default: return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Preparing</Badge>;
    }
  };

  return (
    <PageShell 
      title="Live Sessions" 
      description="Manage and operate live translation sessions."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 text-black hover:bg-amber-400">
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#121214] border-zinc-800 text-gray-100">
            <DialogHeader>
              <DialogTitle>Create Live Session</DialogTitle>
              <DialogDescription className="text-gray-400">
                Start a new live translation session from a prepared Khutba.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Session Title</Label>
                <Input 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. Friday Prayer - Main Hall"
                  className="bg-[#09090b] border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <Label>Select Khutba</Label>
                <Select value={selectedKhutba} onValueChange={setSelectedKhutba}>
                  <SelectTrigger className="bg-[#09090b] border-zinc-800">
                    <SelectValue placeholder="Choose a prepared Khutba" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121214] border-zinc-800 text-gray-100">
                    {khutbas?.map(k => (
                      <SelectItem key={k.id} value={k.id}>{k.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Languages</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SUPPORTED_LANGUAGES.filter(l => l.code !== 'ar').map(lang => (
                    <div key={lang.code} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`lang-${lang.code}`} 
                        checked={selectedLangs.includes(lang.code)}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedLangs([...selectedLangs, lang.code]);
                          else setSelectedLangs(selectedLangs.filter(l => l !== lang.code));
                        }}
                      />
                      <label htmlFor={`lang-${lang.code}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {lang.nameEn}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="border-zinc-800 text-gray-100 hover:bg-zinc-800">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreate} disabled={isCreating || !title || !selectedKhutba || selectedLangs.length === 0} className="bg-amber-500 text-black hover:bg-amber-400">
                Create Session
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="rounded-lg border border-zinc-800 bg-[#121214]">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
              <TableHead>Title</TableHead>
              <TableHead>Khutba</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Listeners</TableHead>
              <TableHead>Languages</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions?.map(session => (
              <TableRow key={session.id} className="border-zinc-800 hover:bg-[#1a1a1e]">
                <TableCell className="font-medium">{session.title}</TableCell>
                <TableCell className="text-gray-400">{session.khutba_title}</TableCell>
                <TableCell>{getStatusBadge(session.status)}</TableCell>
                <TableCell>{session.listener_count}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {session.languages.map(l => (
                      <Badge key={l} variant="outline" className="border-zinc-700 text-xs text-gray-400">{l}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/session/${session.id}/operate`}>
                    <Button size="sm" variant="ghost" className="hover:bg-zinc-800">
                      <Play className="w-4 h-4 mr-2" />
                      Operate
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {sessions?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No sessions found. Create one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </PageShell>
  );
}
