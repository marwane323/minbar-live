"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface KhutbaEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

export function KhutbaEditor({ initialContent, onChange }: KhutbaEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isRtl, setIsRtl] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(content);
      setIsSaving(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaving(true);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch id="rtl-mode" checked={isRtl} onCheckedChange={setIsRtl} />
          <Label htmlFor="rtl-mode">RTL (Arabic) Mode</Label>
        </div>
        <div className="text-sm text-zinc-400">
          {isSaving ? "Saving..." : "Saved"} • {wordCount} words
        </div>
      </div>
      <Textarea
        value={content}
        onChange={handleChange}
        className={cn(
          "min-h-[400px] text-lg bg-[#121214] border-zinc-800 text-gray-100",
          isRtl && "dir-rtl font-arabic text-right"
        )}
        dir={isRtl ? "rtl" : "ltr"}
        placeholder={isRtl ? "اكتب خطبتك هنا..." : "Write your khutba here..."}
      />
    </div>
  );
}
