"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Mic, Square, Upload } from "lucide-react";

export function VoiceProfileSetup({ onUpload }: { onUpload: (blob: Blob) => Promise<void> }) {
  const [consent, setConsent] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.current.onstop = () => {
        setAudioBlob(new Blob(chunks, { type: 'audio/webm' }));
        clearInterval(timerRef.current);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  };

  const handleUpload = async () => {
    if (audioBlob) {
      setIsUploading(true);
      await onUpload(audioBlob);
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <div className="flex items-start space-x-3">
          <Checkbox id="gdpr" checked={consent} onCheckedChange={(c) => setConsent(c as boolean)} className="mt-1" />
          <Label htmlFor="gdpr" className="leading-relaxed">
            <strong>GDPR Article 9 Consent:</strong> I explicitly consent to the collection and processing of my voice biometric data 
            for the purpose of creating a synthetic voice profile to be used in live Khutba translation. 
            I understand I can revoke this consent at any time and request deletion of my profile.
          </Label>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-8 bg-[#121214] border border-zinc-800 rounded-lg space-y-6">
        <div className="text-4xl font-mono text-amber-500">
          {Math.floor(duration / 60).toString().padStart(2, '0')}:{(duration % 60).toString().padStart(2, '0')}
        </div>
        
        <div className="text-sm text-zinc-400">Please read a clear text in your natural speaking voice for 3-10 minutes.</div>

        <div className="flex items-center space-x-4">
          {!isRecording ? (
            <Button onClick={startRecording} disabled={!consent} className="bg-red-500 hover:bg-red-600 text-white rounded-full h-16 w-16 p-0">
              <Mic className="h-8 w-8" />
            </Button>
          ) : (
            <Button onClick={stopRecording} className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-full h-16 w-16 p-0">
              <Square className="h-6 w-6" />
            </Button>
          )}
        </div>

        {audioBlob && !isRecording && (
          <div className="w-full space-y-4">
            <audio src={URL.createObjectURL(audioBlob)} controls className="w-full" />
            <Button onClick={handleUpload} disabled={isUploading || duration < 180} className="w-full bg-amber-500 text-black hover:bg-amber-400">
              {isUploading ? "Uploading..." : "Upload Voice Profile"}
              <Upload className="ml-2 h-4 w-4" />
            </Button>
            {duration < 180 && (
              <p className="text-sm text-red-500 text-center">Recording must be at least 3 minutes long.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
