"use client";

import { useState, useEffect } from "react";
import { useApi, useWebSocket } from "@/lib/hooks";
import { LiveTextView } from "@/components/listen/live-text-view";
import { LiveAudioPlayer } from "@/components/listen/live-audio-player";
import { SessionSummary } from "@/components/listen/session-summary";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertCircle, Loader2 } from "lucide-react";
import { getLanguageName } from "@/lib/types";

interface ListenClientProps {
  sessionId: string;
}

interface PublicSession {
  title: string;
  mosque_name: string;
  languages: string[];
  status: "preparing" | "live" | "paused" | "ended";
}

export function ListenClient({ sessionId }: ListenClientProps) {
  const { data: session, error, isLoading } = useApi<PublicSession>(`/api/sessions/${sessionId}/public`);
  const [selectedLang, setSelectedLang] = useState<string>("en");
  const [mode, setMode] = useState<"read" | "listen">("read");

  useEffect(() => {
    if (session?.languages.length && !session.languages.includes(selectedLang)) {
      setSelectedLang(session.languages[0]);
    }
  }, [session, selectedLang]);

  const { isConnected, on } = useWebSocket(
    session?.status === "live" ? `ws://localhost:8006/ws/listen/${sessionId}?lang=${selectedLang}` : null
  );

  const [sessionStatus, setSessionStatus] = useState(session?.status);

  useEffect(() => {
    if (session?.status) {
      setSessionStatus(session.status);
    }
  }, [session?.status]);

  useEffect(() => {
    const unsub = on("session_status", (payload: any) => {
      setSessionStatus(payload.status);
    });
    return () => unsub();
  }, [on]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold">Session Not Found</h2>
        <p className="text-gray-400">The session you are trying to join does not exist or has ended.</p>
        <Button onClick={() => window.location.href = "/listen"} className="mt-4 bg-zinc-800 text-white hover:bg-zinc-700">
          Go Back
        </Button>
      </div>
    );
  }

  if (sessionStatus === "ended") {
    return <SessionSummary sessionId={sessionId} sessionTitle={session.title} mosqueName={session.mosque_name} />;
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Bar: Languages & Status */}
      <div className="shrink-0 border-b border-zinc-800 bg-[#121214] p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-lg">{session.title}</h1>
            <p className="text-sm text-gray-400">{session.mosque_name}</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="relative flex h-3 w-3">
              {isConnected && sessionStatus === "live" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected && sessionStatus === 'live' ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
            </span>
            <span className={isConnected && sessionStatus === 'live' ? 'text-emerald-500' : 'text-gray-500'}>
              {sessionStatus === "live" ? (isConnected ? "Live" : "Connecting...") : "Waiting..."}
            </span>
          </div>
        </div>

        {/* Language Selector */}
        {session.languages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {session.languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedLang === lang 
                    ? "bg-amber-500 text-black" 
                    : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                }`}
              >
                {getLanguageName(lang)}
              </button>
            ))}
          </div>
        )}

        {/* Mode Toggle */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as "read" | "listen")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="read" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
              Read Translation
            </TabsTrigger>
            <TabsTrigger value="listen" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
              Listen Audio
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {mode === "read" ? (
          <LiveTextView on={on} language={selectedLang} isLive={sessionStatus === "live"} />
        ) : (
          <LiveAudioPlayer on={on} language={selectedLang} isLive={sessionStatus === "live"} />
        )}
      </div>
    </div>
  );
}
