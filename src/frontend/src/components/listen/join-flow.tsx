"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, ArrowRight } from "lucide-react";
import { api, ApiError } from "@/lib/api";

export function JoinFlow() {
  const [sessionId, setSessionId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      await api.get(`/api/sessions/${sessionId.trim()}/public`);
      router.push(`/listen/${sessionId.trim()}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError("Session not found. Please check the ID and try again.");
      } else {
        setError("Failed to connect. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleJoin} className="space-y-4 w-full">
      <div className="space-y-2">
        <div className="relative">
          <Input
            type="text"
            placeholder="e.g. al-noor-friday-1"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="h-14 text-lg bg-[#121214] border-zinc-800 text-center uppercase focus:ring-amber-500/50"
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-10 w-10 text-gray-400 hover:text-white"
            onClick={() => alert("QR Scanner coming soon")}
          >
            <QrCode className="h-5 w-5" />
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
      </div>

      <Button
        type="submit"
        className="w-full h-14 text-lg bg-amber-500 text-black hover:bg-amber-400 font-semibold"
        disabled={isLoading || !sessionId.trim()}
      >
        {isLoading ? "Joining..." : "Join Live Khutba"}
        {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
      </Button>
    </form>
  );
}
