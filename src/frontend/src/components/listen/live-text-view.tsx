"use client";

import { useState, useEffect, useRef } from "react";
import { RTLText } from "@/components/arabic/rtl-text";
import { QuranVerse } from "@/components/arabic/quran-verse";
import { Button } from "@/components/ui/button";
import { Type, Moon, Sun } from "lucide-react";
import { getLanguage } from "@/lib/types";

interface SegmentData {
  index: number;
  text: string;
  type: "text" | "quran" | "hadith" | "dua";
  quran_ref?: { surah: number; surah_name: string; ayah_start: number; ayah_end: number; text: string };
}

interface LiveTextViewProps {
  on: (event: string, handler: (data: any) => void) => () => void;
  language: string;
  isLive: boolean;
}

export function LiveTextView({ on, language, isLive }: LiveTextViewProps) {
  const [segments, setSegments] = useState<SegmentData[]>([]);
  const [fontSize, setFontSize] = useState<number>(18);
  const [highContrast, setHighContrast] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset when language changes
    setSegments([]);
  }, [language]);

  useEffect(() => {
    const unsub = on("translation_update", (payload: any) => {
      setSegments((prev) => {
        const exists = prev.find(s => s.index === payload.segment_index);
        if (exists) {
          return prev.map(s => s.index === payload.segment_index ? { ...s, text: payload.text, type: payload.type || "text", quran_ref: payload.quran_ref } : s);
        }
        return [...prev, { 
          index: payload.segment_index, 
          text: payload.text, 
          type: payload.type || "text",
          quran_ref: payload.quran_ref
        }].sort((a, b) => a.index - b.index);
      });
    });
    return () => unsub();
  }, [on]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments]);

  const langInfo = getLanguage(language);
  const isRtl = langInfo?.dir === "rtl";

  return (
    <div className={`flex flex-col h-full ${highContrast ? 'bg-black text-white' : ''}`}>
      {/* Toolbar */}
      <div className={`shrink-0 flex items-center justify-end gap-2 p-2 border-b ${highContrast ? 'border-zinc-800' : 'border-zinc-800/50'} bg-black/20`}>
        <Button variant="ghost" size="sm" onClick={() => setFontSize(f => Math.max(14, f - 2))} className="h-8 w-8 p-0">
          <Type className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setFontSize(f => Math.min(32, f + 2))} className="h-8 w-8 p-0">
          <Type className="h-5 w-5" />
        </Button>
        <div className="w-px h-4 bg-zinc-800 mx-1" />
        <Button variant="ghost" size="sm" onClick={() => setHighContrast(!highContrast)} className="h-8 w-8 p-0">
          {highContrast ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      {/* Content */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 space-y-6 scroll-smooth"
        dir={isRtl ? "rtl" : "ltr"}
        style={{ fontSize: `${fontSize}px` }}
      >
        {segments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
            <p>{isLive ? "Waiting for translation..." : "Session has not started yet."}</p>
          </div>
        ) : (
          segments.map((segment) => (
            <div key={segment.index} className={`leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300 ${isRtl ? 'font-arabic' : 'font-sans'}`}>
              {segment.type === "quran" && segment.quran_ref ? (
                <div className="my-6">
                  <QuranVerse 
                    text={segment.quran_ref.text} 
                    translation={segment.text}
                    surah={segment.quran_ref.surah}
                    surahName={segment.quran_ref.surah_name}
                    ayahStart={segment.quran_ref.ayah_start}
                    ayahEnd={segment.quran_ref.ayah_end}
                  />
                </div>
              ) : segment.type === "hadith" ? (
                <div className="my-4 border-l-2 border-emerald-500/50 pl-4 bg-emerald-500/5 py-3 pr-3 rounded-r-lg">
                  <p>{segment.text}</p>
                </div>
              ) : (
                <p className={`${segment.index === segments.length - 1 ? (highContrast ? 'text-white' : 'text-gray-100') : (highContrast ? 'text-gray-300' : 'text-gray-400')}`}>
                  {isRtl ? <RTLText className="inline">{segment.text}</RTLText> : segment.text}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
