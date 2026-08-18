"use client";

import { useEffect, useState, useRef } from "react";
import { useWebSocket } from "@/lib/hooks";
import { Khutba, TranscriptPayload } from "@/lib/types";
import { RTLText } from "@/components/arabic/rtl-text";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LiveTranscriptProps {
  khutba: Khutba;
  currentIndex: number;
  wsUrl: string;
}

export function LiveTranscript({ khutba, currentIndex, wsUrl }: LiveTranscriptProps) {
  const { on } = useWebSocket(wsUrl);
  const [livePayloads, setLivePayloads] = useState<Record<number, TranscriptPayload>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = on("transcript_update", (data: any) => {
      const payload = data as TranscriptPayload;
      setLivePayloads(prev => ({
        ...prev,
        [payload.segment_index]: payload
      }));
    });
    return unsub;
  }, [on]);

  useEffect(() => {
    // Auto-scroll to current active segment
    const activeEl = document.getElementById(`segment-${currentIndex}`);
    if (activeEl && scrollRef.current) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex]);

  const getConfidenceColor = (conf?: number) => {
    if (conf === undefined) return "bg-gray-500/10 text-gray-500";
    if (conf > 0.8) return "bg-emerald-500/10 text-emerald-500";
    if (conf > 0.5) return "bg-amber-500/10 text-amber-500";
    return "bg-red-500/10 text-red-500";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800 bg-[#121214]">
        <h2 className="text-lg font-semibold text-gray-100">Live Transcript (ASR)</h2>
      </div>
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-6 max-w-3xl mx-auto pb-32">
          {khutba.segments.map((segment, idx) => {
            const isActive = idx === currentIndex;
            const isPast = idx < currentIndex;
            const payload = livePayloads[idx];

            return (
              <div 
                key={segment.id} 
                id={`segment-${idx}`}
                className={cn(
                  "p-4 rounded-lg border transition-colors",
                  isActive ? "border-amber-500/50 bg-[#1a1a1e]" : 
                  isPast ? "border-zinc-800 bg-zinc-900/50 opacity-70" : 
                  "border-zinc-800/50 bg-transparent opacity-50"
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="outline" className="text-zinc-500 border-zinc-700">
                    Segment {idx + 1}
                  </Badge>
                  {payload && (
                    <Badge className={getConfidenceColor(payload.confidence)}>
                      {Math.round(payload.confidence * 100)}% Conf
                    </Badge>
                  )}
                </div>
                
                {/* Prepared Text */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Prepared Script</p>
                  <RTLText className="text-gray-300 text-lg leading-relaxed">
                    {segment.text}
                  </RTLText>
                </div>

                {/* Live ASR Text */}
                {payload && (
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Live Recognition</p>
                    <RTLText className={cn(
                      "text-lg leading-relaxed",
                      payload.is_deviation ? "text-red-400" : "text-emerald-400"
                    )}>
                      {payload.text}
                    </RTLText>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
