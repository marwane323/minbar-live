"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useApi, useWebSocket } from "@/lib/hooks";
import { Session, Khutba, TranscriptPayload } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { LiveTranscript } from "@/components/session/live-transcript";
import { MultiLanguagePanel } from "@/components/session/multi-language-panel";
import { SessionControls } from "@/components/session/session-controls";
import { AudioDeviceSelector } from "@/components/session/audio-device-selector";
import { LatencyMonitor } from "@/components/session/latency-monitor";

export default function OperatePage() {
  const params = useParams();
  const sessionId = params.id as string;
  
  const { data: session, refetch: refetchSession } = useApi<Session>(`/api/sessions/${sessionId}`);
  const { data: khutba } = useApi<Khutba>(session ? `/api/khutbas/${session.khutba_id}` : null);
  
  const { isConnected, on } = useWebSocket(`ws://localhost:8006/ws/session/${sessionId}`);
  
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [listenerCount, setListenerCount] = useState(0);
  const [status, setStatus] = useState(session?.status || "preparing");
  
  useEffect(() => {
    if (session) {
      setStatus(session.status);
      setListenerCount(session.listener_count);
      setCurrentSegmentIndex(session.current_segment_index);
    }
  }, [session]);
  
  useEffect(() => {
    const unsubStatus = on("session_status", (data: any) => {
      setStatus(data.status);
      setListenerCount(data.listener_count);
    });
    
    const unsubTranscript = on("transcript_update", (data: any) => {
      const payload = data as TranscriptPayload;
      if (payload.segment_index !== undefined) {
        setCurrentSegmentIndex(payload.segment_index);
      }
    });
    
    return () => {
      unsubStatus();
      unsubTranscript();
    };
  }, [on]);

  if (!session || !khutba) return <div className="p-8 text-gray-400">Loading session...</div>;

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#121214]">
        <div>
          <h1 className="text-xl font-bold text-gray-100">{session.title}</h1>
          <p className="text-sm text-gray-400">{khutba.title}</p>
        </div>
        <div className="flex items-center space-x-4">
          <AudioDeviceSelector />
          <LatencyMonitor isConnected={isConnected} wsUrl={`ws://localhost:8006/ws/session/${sessionId}`} />
          <Badge className="bg-zinc-800 text-gray-300">
            {listenerCount} Listeners
          </Badge>
          <Badge className={
            status === 'live' ? "bg-emerald-500/10 text-emerald-500" :
            status === 'paused' ? "bg-amber-500/10 text-amber-500" :
            status === 'ended' ? "bg-red-500/10 text-red-500" :
            "bg-blue-500/10 text-blue-500"
          }>
            {status.toUpperCase()}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Transcript */}
        <div className="w-[60%] border-r border-zinc-800 flex flex-col bg-[#09090b]">
          <LiveTranscript 
            khutba={khutba} 
            currentIndex={currentSegmentIndex} 
            wsUrl={`ws://localhost:8006/ws/session/${sessionId}`} 
          />
        </div>

        {/* Right Panel: Translations */}
        <div className="w-[40%] flex flex-col bg-[#121214]">
          <MultiLanguagePanel 
            languages={session.languages} 
            wsUrl={`ws://localhost:8006/ws/session/${sessionId}`}
            khutba={khutba}
            currentIndex={currentSegmentIndex}
          />
        </div>
      </div>

      {/* Bottom Bar: Controls */}
      <div className="border-t border-zinc-800 bg-[#121214] p-4">
        <SessionControls 
          sessionId={sessionId} 
          status={status} 
          onStatusChange={refetchSession} 
        />
      </div>
    </div>
  );
}
