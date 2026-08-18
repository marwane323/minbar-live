"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { KhutbaEditor } from "@/components/imam/khutba-editor";
import { VerseHighlighter } from "@/components/imam/verse-highlighter";
import { useApi, useMutation } from "@/lib/hooks";
import { api } from "@/lib/api";
import { Khutba } from "@/lib/types";

export default function EditKhutbaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: khutba, isLoading, refetch } = useApi<Khutba>(`/api/khutbas/${params.id}`);
  const { mutate: detectMutate, isLoading: isDetecting } = useMutation<Khutba>();
  const [content, setContent] = useState("");

  if (isLoading || !khutba) return <div className="p-8 text-zinc-400">Loading...</div>;

  const handleDetect = async () => {
    await detectMutate(() => api.post<Khutba>(`/api/khutbas/${khutba.id}/detect`));
    refetch();
  };

  const handleTranslate = () => {
    router.push(`/imam/khutba/${khutba.id}/translate`);
  };

  return (
    <PageShell 
      title={khutba.title}
      description="Edit and prepare your Khutba"
      actions={
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleDetect}
            disabled={isDetecting}
            className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
          >
            {isDetecting ? "Detecting..." : "Detect Verses"}
          </Button>
          <Button 
            onClick={handleTranslate}
            className="bg-amber-500 text-black hover:bg-amber-400"
          >
            Review Translations
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-medium text-gray-100 mb-4">Content</h2>
          <KhutbaEditor initialContent={khutba.content} onChange={setContent} />
        </div>
        <div>
          <h2 className="text-lg font-medium text-gray-100 mb-4">Detected Segments</h2>
          <VerseHighlighter segments={khutba.segments || []} />
        </div>
      </div>
    </PageShell>
  );
}
