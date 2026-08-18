"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks";
import { Session } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, FileText, FileVideo2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function SessionArchive() {
  const { data: sessions, isLoading } = useApi<Session[]>("/api/sessions");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSessions = sessions?.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.khutba_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ended":
        return <Badge className="bg-zinc-800 text-gray-300">Ended</Badge>;
      case "live":
        return <Badge className="bg-red-500/10 text-red-500">Live</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-[#09090b] border-zinc-800 text-gray-200 focus-visible:ring-amber-500"
          />
        </div>
      </div>

      <div className="rounded-md border border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-gray-400">Title</TableHead>
              <TableHead className="text-gray-400">Date</TableHead>
              <TableHead className="text-gray-400">Languages</TableHead>
              <TableHead className="text-gray-400 text-right">Listeners</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-right text-gray-400">Export</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                  Loading sessions...
                </TableCell>
              </TableRow>
            ) : filteredSessions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  No sessions found.
                </TableCell>
              </TableRow>
            ) : (
              filteredSessions?.map((session) => (
                <TableRow key={session.id} className="border-zinc-800 hover:bg-[#1a1a1e] cursor-pointer">
                  <TableCell className="font-medium text-gray-200">{session.title}</TableCell>
                  <TableCell className="text-gray-400">
                    {new Date(session.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">
                    {session.languages.join(", ").toUpperCase()}
                  </TableCell>
                  <TableCell className="text-right text-gray-400">{session.listener_count}</TableCell>
                  <TableCell>{getStatusBadge(session.status)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-amber-500 hover:bg-amber-500/10">
                      <FileText className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-amber-500 hover:bg-amber-500/10">
                      <FileVideo2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
