"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Radio } from "lucide-react";
import { getLanguageName } from "@/lib/types";

interface LiveAudioPlayerProps {
  on: (event: string, handler: (data: any) => void) => () => void;
  language: string;
  isLive: boolean;
}

export function LiveAudioPlayer({ on, language, isLive }: LiveAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Reset on language change
    setQueue([]);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
  }, [language]);

  useEffect(() => {
    const unsub = on("audio_update", (payload: any) => {
      if (payload.audio_url) {
        setQueue((prev) => [...prev, payload.audio_url]);
      }
    });
    return () => unsub();
  }, [on]);

  const playNext = () => {
    if (queue.length > 0 && isPlaying && audioRef.current) {
      const nextUrl = queue[0];
      audioRef.current.src = nextUrl;
      audioRef.current.play().catch(console.error);
      setQueue((prev) => prev.slice(1));
    }
  };

  useEffect(() => {
    if (isPlaying && queue.length > 0 && audioRef.current && audioRef.current.paused) {
      playNext();
    }
  }, [queue, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      audioRef.current?.pause();
    } else {
      setIsPlaying(true);
      if (audioRef.current?.paused && queue.length > 0) {
        playNext();
      }
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 space-y-12 bg-gradient-to-b from-transparent to-black/40">
      <audio 
        ref={audioRef} 
        onEnded={playNext}
        className="hidden" 
      />

      <div className="text-center space-y-4">
        <div className="relative inline-flex">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${isPlaying ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800 bg-zinc-900'} transition-colors duration-500`}>
            <Radio className={`w-12 h-12 ${isPlaying ? 'text-amber-500 animate-pulse' : 'text-gray-600'}`} />
          </div>
          {isPlaying && (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-amber-500 opacity-20 animate-ping"></div>
              <div className="absolute inset-[-1rem] rounded-full border-2 border-amber-500 opacity-10 animate-ping delay-150"></div>
            </>
          )}
        </div>
        <div>
          <h3 className="text-xl font-medium">
            {getLanguageName(language)} Translation
          </h3>
          <p className="text-gray-400 mt-1">
            {isLive ? (queue.length > 0 ? `${queue.length} segments in queue` : "Waiting for audio...") : "Session offline"}
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-8 bg-[#121214] p-6 rounded-2xl border border-zinc-800">
        <div className="flex justify-center">
          <Button 
            onClick={togglePlay}
            disabled={!isLive}
            size="icon"
            className="w-20 h-20 rounded-full bg-amber-500 text-black hover:bg-amber-400 hover:scale-105 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="text-gray-400 hover:text-white shrink-0"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={([v]) => {
              setVolume(v);
              setIsMuted(v === 0);
            }}
            max={100}
            step={1}
            className="w-full [&>span:first-child]:bg-zinc-700 [&_[role=slider]]:bg-amber-500 [&_[role=slider]]:border-amber-500 [&>span>span]:bg-amber-500"
          />
        </div>
      </div>
    </div>
  );
}
