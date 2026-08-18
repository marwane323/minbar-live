"use client";

import { useEffect, useState } from "react";
import { useWebSocket } from "@/lib/hooks";
import { Khutba, TranslationPayload, getLanguageName } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MultiLanguagePanelProps {
  languages: string[];
  wsUrl: string;
  khutba: Khutba;
  currentIndex: number;
}

export function MultiLanguagePanel({ languages, wsUrl, khutba, currentIndex }: MultiLanguagePanelProps) {
  const { on } = useWebSocket(wsUrl);
  const [liveTranslations, setLiveTranslations] = useState<Record<string, Record<number, string>>>({});
  
  useEffect(() => {
    const unsub = on("translation_update", (data: any) => {
      const payload = data as TranslationPayload;
      setLiveTranslations(prev => ({
        ...prev,
        [payload.language]: {
          ...(prev[payload.language] || {}),
          [payload.segment_index]: payload.text
        }
      }));
    });
    return unsub;
  }, [on]);

  if (!languages.length) {
    return <div className="p-8 text-gray-500 text-center">No languages selected.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800 bg-[#121214]">
        <h2 className="text-lg font-semibold text-gray-100">Live Translations</h2>
      </div>
      
      <Tabs defaultValue={languages[0]} className="flex-1 flex flex-col h-full w-full">
        <div className="px-4 pt-2 border-b border-zinc-800 bg-[#09090b]">
          <TabsList className="bg-[#121214] border border-zinc-800">
            {languages.map(lang => (
              <TabsTrigger key={lang} value={lang} className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                {getLanguageName(lang)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {languages.map(lang => (
          <TabsContent key={lang} value={lang} className="flex-1 m-0 overflow-hidden outline-none">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4 pb-32">
                {khutba.segments.map((segment, idx) => {
                  const isActive = idx === currentIndex;
                  const isPast = idx < currentIndex;
                  const preparedText = segment.translations?.[lang] || "No prepared translation.";
                  const liveText = liveTranslations[lang]?.[idx];

                  return (
                    <div 
                      key={idx}
                      className={cn(
                        "p-3 rounded-lg border",
                        isActive ? "border-amber-500/50 bg-[#1a1a1e]" : 
                        isPast ? "border-zinc-800/50 text-gray-400" : 
                        "border-transparent opacity-50"
                      )}
                    >
                      <div className="text-xs text-zinc-500 mb-1">Segment {idx + 1}</div>
                      <div className="text-gray-200">
                        {liveText || preparedText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
