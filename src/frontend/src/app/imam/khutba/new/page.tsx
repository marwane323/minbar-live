"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { KhutbaEditor } from "@/components/imam/khutba-editor";
import { useMutation } from "@/lib/hooks";
import { api } from "@/lib/api";
import { Khutba, SUPPORTED_LANGUAGES } from "@/lib/types";

export default function NewKhutbaPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("ar");
  const [content, setContent] = useState("");
  const { mutate, isLoading } = useMutation<Khutba>();

  const handleSave = async () => {
    const khutba = await mutate(() => 
      api.post<Khutba>('/api/khutbas', { title, language, content, target_languages: ["en", "fr"] })
    );
    if (khutba?.id) {
      router.push(`/imam/khutba/${khutba.id}/edit`);
    }
  };

  return (
    <PageShell 
      title="Create New Khutba"
      actions={
        <Button 
          onClick={handleSave} 
          disabled={isLoading || !title}
          className="bg-amber-500 text-black hover:bg-amber-400"
        >
          {isLoading ? "Saving..." : "Save Draft"}
        </Button>
      }
    >
      <div className="space-y-6 max-w-4xl">
        <div className="grid grid-cols-2 gap-4">
          <Input 
            placeholder="Khutba Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="bg-[#121214] border-zinc-800 text-gray-100"
          />
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="bg-[#121214] border-zinc-800 text-gray-100">
              <SelectValue placeholder="Source Language" />
            </SelectTrigger>
            <SelectContent className="bg-[#121214] border-zinc-800">
              {SUPPORTED_LANGUAGES.map(lang => (
                <SelectItem key={lang.code} value={lang.code} className="text-gray-100 focus:bg-zinc-800 focus:text-white">
                  {lang.nameEn} ({lang.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <KhutbaEditor initialContent="" onChange={setContent} />
      </div>
    </PageShell>
  );
}
