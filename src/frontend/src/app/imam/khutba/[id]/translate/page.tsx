"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TranslationReview } from "@/components/imam/translation-review";
import { useApi, useMutation, usePolling } from "@/lib/hooks";
import { api } from "@/lib/api";
import { Khutba, TranslationJob } from "@/lib/types";

export default function TranslateKhutbaPage({ params }: { params: { id: string } }) {
  const { data: khutba, refetch: refetchKhutba } = useApi<Khutba>(`/api/khutbas/${params.id}`);
  const { mutate: translateMutate, isLoading: isTranslating } = useMutation<{job_id: string}>();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  
  const { data: job } = usePolling<TranslationJob>(
    activeJobId ? `/api/translation-jobs/${activeJobId}` : null,
    2000
  );

  const startTranslation = async () => {
    const result = await translateMutate(() => api.post(`/api/khutbas/${params.id}/translate`));
    if (result?.job_id) {
      setActiveJobId(result.job_id);
    }
  };

  const handleUpdateTranslation = async (segmentId: string, translation: string, approved: boolean) => {
    await api.put(`/api/khutbas/${params.id}/segments/${segmentId}`, { translation, approved });
  };

  if (!khutba) return <div className="p-8 text-zinc-400">Loading...</div>;

  return (
    <PageShell 
      title={`Translate: ${khutba.title}`}
      actions={
        <Button 
          onClick={startTranslation}
          disabled={isTranslating || (job && job.status === "processing")}
          className="bg-amber-500 text-black hover:bg-amber-400"
        >
          Trigger Auto-Translation
        </Button>
      }
    >
      {job && job.status === "processing" && (
        <div className="mb-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-100">Translating to {job.target_language}</span>
              <span className="text-amber-500">{Math.round((job.segments_completed / job.segments_total) * 100)}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 transition-all duration-300" 
                style={{ width: `${(job.segments_completed / job.segments_total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {khutba.target_languages?.length > 0 ? (
        <Tabs defaultValue={khutba.target_languages[0]}>
          <TabsList className="bg-[#121214] border border-zinc-800">
            {khutba.target_languages.map(lang => (
              <TabsTrigger key={lang} value={lang} className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                {lang.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
          {khutba.target_languages.map(lang => (
            <TabsContent key={lang} value={lang} className="mt-6">
              <TranslationReview 
                segments={khutba.segments || []} 
                targetLanguage={lang} 
                onUpdate={handleUpdateTranslation}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="p-8 text-center text-zinc-400 border border-dashed border-zinc-700 rounded-lg">
          No target languages selected for this Khutba.
        </div>
      )}
    </PageShell>
  );
}
