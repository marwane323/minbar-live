"use client";

import { useState } from "react";
import { useApi, useMutation } from "@/lib/hooks";
import { GlossaryEntry } from "@/lib/types";
import { api } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash, Edit } from "lucide-react";
import { RTLText } from "@/components/arabic/rtl-text";

export function GlossaryEditor() {
  const { data: entries, isLoading, refetch } = useApi<GlossaryEntry[]>("/api/admin/glossary");
  const { mutate } = useMutation();
  const [newArabic, setNewArabic] = useState("");
  const [newTranslit, setNewTranslit] = useState("");
  const [newEnglish, setNewEnglish] = useState("");

  const handleAdd = async () => {
    if (!newArabic || !newEnglish) return;
    
    await mutate(() => api.post("/api/admin/glossary", {
      term_arabic: newArabic,
      term_transliteration: newTranslit,
      translations: { en: newEnglish }
    }));
    
    setNewArabic("");
    setNewTranslit("");
    setNewEnglish("");
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this glossary entry?")) {
      await mutate(() => api.delete(`/api/admin/glossary/${id}`));
      refetch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input 
          placeholder="Arabic (e.g. تقوى)" 
          value={newArabic}
          onChange={(e) => setNewArabic(e.target.value)}
          className="bg-[#09090b] border-zinc-800 text-right font-arabic" 
          dir="rtl"
        />
        <Input 
          placeholder="Transliteration (e.g. Taqwa)" 
          value={newTranslit}
          onChange={(e) => setNewTranslit(e.target.value)}
          className="bg-[#09090b] border-zinc-800" 
        />
        <Input 
          placeholder="English Translation (e.g. God-consciousness)" 
          value={newEnglish}
          onChange={(e) => setNewEnglish(e.target.value)}
          className="bg-[#09090b] border-zinc-800" 
        />
        <Button onClick={handleAdd} className="bg-amber-500 text-black hover:bg-amber-400 whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" /> Add Term
        </Button>
      </div>

      <div className="border border-zinc-800 rounded-md mt-4">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-gray-400 text-right">Arabic</TableHead>
              <TableHead className="text-gray-400">Transliteration</TableHead>
              <TableHead className="text-gray-400">English</TableHead>
              <TableHead className="text-right text-gray-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-4">Loading...</TableCell>
              </TableRow>
            ) : entries?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-4">No glossary entries found.</TableCell>
              </TableRow>
            ) : (
              entries?.map((entry) => (
                <TableRow key={entry.id} className="border-zinc-800 hover:bg-[#1a1a1e]">
                  <TableCell className="text-right">
                    <RTLText className="text-amber-500 font-bold">{entry.term_arabic}</RTLText>
                  </TableCell>
                  <TableCell className="text-gray-300">{entry.term_transliteration}</TableCell>
                  <TableCell className="text-gray-300">{entry.translations?.en || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-200">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-500 hover:text-red-500"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash className="w-4 h-4" />
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
