"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeDisplay } from "./qr-code-display";
import { Play, Pause, Square, SkipForward, MicOff, QrCode } from "lucide-react";
import { api } from "@/lib/api";
import { useMutation } from "@/lib/hooks";

interface SessionControlsProps {
  sessionId: string;
  status: string;
  onStatusChange: () => void;
}

export function SessionControls({ sessionId, status, onStatusChange }: SessionControlsProps) {
  const { mutate, isLoading } = useMutation();

  const handleAction = async (action: 'start' | 'pause' | 'end') => {
    await mutate(() => api.post(`/api/sessions/${sessionId}/${action}`, {}));
    onStatusChange();
  };

  const handleNextSegment = async () => {
    await mutate(() => api.post(`/api/sessions/${sessionId}/next`, {}));
    onStatusChange();
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {status === 'preparing' || status === 'paused' ? (
          <Button 
            onClick={() => handleAction('start')} 
            disabled={isLoading || status === 'ended'}
            className="bg-emerald-500 text-black hover:bg-emerald-400"
          >
            <Play className="w-4 h-4 mr-2" /> Start Session
          </Button>
        ) : (
          <Button 
            onClick={() => handleAction('pause')} 
            disabled={isLoading || status === 'ended'}
            className="bg-amber-500 text-black hover:bg-amber-400"
          >
            <Pause className="w-4 h-4 mr-2" /> Pause Session
          </Button>
        )}
        
        <Button 
          variant="destructive"
          onClick={() => handleAction('end')}
          disabled={isLoading || status === 'ended'}
          className="bg-red-500/10 text-red-500 hover:bg-red-500/20"
        >
          <Square className="w-4 h-4 mr-2" /> End Session
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="outline" className="border-zinc-800 text-gray-300 hover:bg-zinc-800">
          <MicOff className="w-4 h-4 mr-2" /> Mute
        </Button>
        <Button variant="outline" onClick={handleNextSegment} className="border-zinc-800 text-gray-300 hover:bg-zinc-800">
          <SkipForward className="w-4 h-4 mr-2" /> Force Next
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-zinc-800 text-gray-300 hover:bg-zinc-800">
              <QrCode className="w-4 h-4 mr-2" /> Show QR
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#121214] border-zinc-800 text-gray-100 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Join Session</DialogTitle>
            </DialogHeader>
            <QRCodeDisplay sessionId={sessionId} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
