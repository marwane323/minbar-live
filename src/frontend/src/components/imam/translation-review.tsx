"use client";

import { Segment } from "@/lib/types";
import { RTLText } from "@/components/arabic/rtl-text";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TranslationReviewProps {
  segments: Segment[];
  targetLanguage: string;
  onUpdate: (segmentId: string, translation: string, approved: boolean) => void;
}

export function TranslationReview({ segments, targetLanguage, onUpdate }: TranslationReviewProps) {
  return (
    <div className="space-y-6">
      {segments.map((segment) => (
        <div key={segment.id} className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#121214] border border-zinc-800 rounded">
            <RTLText className="text-gray-100">{segment.text}</RTLText>
            {segment.type !== "text" && (
              <div className="mt-2 text-xs text-amber-500">
                {segment.type === "quran" ? "Quran Reference" : "Hadith Reference"}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Textarea 
              defaultValue={segment.translations?.[targetLanguage] || ""}
              onChange={(e) => onUpdate(segment.id, e.target.value, segment.approved?.[targetLanguage] || false)}
              className="w-full h-full min-h-[100px] bg-[#121214] border-zinc-800 text-gray-100"
            />
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`approve-${segment.id}`} 
                defaultChecked={segment.approved?.[targetLanguage] || false}
                onCheckedChange={(checked) => onUpdate(segment.id, segment.translations?.[targetLanguage] || "", checked as boolean)}
              />
              <Label htmlFor={`approve-${segment.id}`}>Approve translation</Label>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
