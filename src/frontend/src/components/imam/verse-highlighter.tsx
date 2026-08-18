import { Segment } from "@/lib/types";
import { RTLText } from "@/components/arabic/rtl-text";
import { QuranVerse } from "@/components/arabic/quran-verse";

export function VerseHighlighter({ segments }: { segments: Segment[] }) {
  return (
    <div className="space-y-4">
      {segments.map((segment) => {
        if (segment.type === "quran") {
          return (
            <div key={segment.id} className="p-4 border-l-2 border-amber-500/50 bg-amber-500/5 rounded-r">
              <RTLText className="text-amber-500">{segment.text}</RTLText>
              <div className="text-xs text-amber-500/70 mt-2 text-right">
                {segment.quran_ref?.surah_name} ({segment.quran_ref?.surah}:{segment.quran_ref?.ayah_start})
              </div>
            </div>
          );
        }
        if (segment.type === "hadith") {
          return (
            <div key={segment.id} className="p-4 border-l-2 border-emerald-500/50 bg-emerald-500/5 rounded-r">
              <RTLText className="text-emerald-500">{segment.text}</RTLText>
              <div className="text-xs text-emerald-500/70 mt-2 text-right">
                {segment.hadith_ref?.source} - {segment.hadith_ref?.book} ({segment.hadith_ref?.number})
              </div>
            </div>
          );
        }
        return (
          <div key={segment.id} className="p-4 bg-[#121214] border border-zinc-800 rounded">
            <RTLText className="text-gray-100">{segment.text}</RTLText>
          </div>
        );
      })}
    </div>
  );
}
