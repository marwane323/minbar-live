"use client";

import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

export function QRCodeDisplay({ sessionId }: { sessionId: string }) {
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/listen/${sessionId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-4">
      <div className="bg-white p-4 rounded-xl">
        <QRCodeSVG value={url} size={200} level="H" includeMargin={true} />
      </div>
      <div className="flex items-center space-x-2 bg-[#09090b] p-2 rounded-lg border border-zinc-800 w-full">
        <code className="text-sm text-amber-500 flex-1 truncate px-2">{url}</code>
        <Button variant="ghost" size="sm" onClick={copyToClipboard} className="hover:bg-zinc-800">
          <Copy className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-sm text-gray-400 text-center">
        Scan this code to join the live translation stream on your device.
      </p>
    </div>
  );
}
