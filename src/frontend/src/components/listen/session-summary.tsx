"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Download, FileText, FileAudio, CheckCircle2 } from "lucide-react";

interface SessionSummaryProps {
  sessionId: string;
  sessionTitle: string;
  mosqueName: string;
}

export function SessionSummary({ sessionId, sessionTitle, mosqueName }: SessionSummaryProps) {
  const handleDownload = (format: string) => {
    alert(`Downloading summary in ${format.toUpperCase()} format...`);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md bg-[#121214] border-zinc-800">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl">Session Ended</CardTitle>
          <CardDescription className="text-base mt-2 text-gray-400">
            {sessionTitle} at {mosqueName} has concluded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-400 text-center uppercase tracking-wider">Download Translation</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="w-full border-zinc-700 hover:bg-zinc-800 gap-2 h-auto py-3 flex-col"
                onClick={() => handleDownload('pdf')}
              >
                <FileText className="w-5 h-5 text-red-400 mb-1" />
                <span>PDF Document</span>
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-zinc-700 hover:bg-zinc-800 gap-2 h-auto py-3 flex-col"
                onClick={() => handleDownload('txt')}
              >
                <FileText className="w-5 h-5 text-blue-400 mb-1" />
                <span>Plain Text</span>
              </Button>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-zinc-700 hover:bg-zinc-800 gap-2 mt-3"
              onClick={() => handleDownload('srt')}
            >
              <FileAudio className="w-4 h-4 text-amber-400" />
              <span>Subtitles (SRT)</span>
            </Button>
          </div>
          
          <div className="pt-4 border-t border-zinc-800 text-center">
            <Button 
              onClick={() => window.location.href = "/listen"} 
              className="bg-amber-500 text-black hover:bg-amber-400 w-full"
            >
              Join Another Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
