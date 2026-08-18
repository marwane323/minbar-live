"use client";

import { useEffect, useState } from "react";
import { Mic } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function AudioDeviceSelector() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [level, setLevel] = useState(0);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const audioInputs = devices.filter(d => d.kind === 'audioinput');
      setDevices(audioInputs);
      if (audioInputs.length > 0) setSelectedDevice(audioInputs[0].deviceId);
    });
  }, []);

  // Simple mock level meter update
  useEffect(() => {
    const timer = setInterval(() => {
      setLevel(Math.random() * 100);
    }, 200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center space-x-2 bg-[#09090b] border border-zinc-800 rounded-md p-1 px-2">
      <Mic className="w-4 h-4 text-gray-400" />
      <Select value={selectedDevice} onValueChange={setSelectedDevice}>
        <SelectTrigger className="w-40 h-8 border-0 bg-transparent shadow-none focus:ring-0 text-sm">
          <SelectValue placeholder="Select mic" />
        </SelectTrigger>
        <SelectContent className="bg-[#121214] border-zinc-800 text-gray-100">
          {devices.map(d => (
            <SelectItem key={d.deviceId} value={d.deviceId}>
              {d.label || `Microphone ${d.deviceId.slice(0,5)}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="w-16 h-2 bg-zinc-800 rounded overflow-hidden">
        <div 
          className="h-full bg-emerald-500 transition-all duration-75"
          style={{ width: `${level}%` }}
        />
      </div>
    </div>
  );
}
