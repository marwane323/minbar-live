import * as React from "react"
import { cn } from "@/lib/utils"
import { RTLText } from "./rtl-text"
import { Badge } from "@/components/ui/badge"

export interface QuranVerseProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
  translation?: string
  surah?: number
  surahName?: string
  ayahStart: number
  ayahEnd?: number
}

export function QuranVerse({
  text,
  translation,
  surah,
  surahName,
  ayahStart,
  ayahEnd,
  className,
  ...props
}: QuranVerseProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-l-2 border-amber-500/50 bg-amber-500/5 p-4 rounded-r-md",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-3">
        <RTLText className="text-xl md:text-2xl leading-loose text-gray-100">
          {text} ۝
        </RTLText>
        
        {translation && (
          <p className="text-gray-300 italic text-sm md:text-base leading-relaxed border-t border-amber-500/10 pt-3">
            "{translation}"
          </p>
        )}
      </div>
      
      {(surah !== undefined || surahName || ayahStart) && (
        <div className="flex items-center self-end md:self-start">
          <Badge variant="outline" className="border-amber-500/30 text-amber-500/90 font-normal">
            {surahName && `${surahName} `}
            {surah && `(${surah}) `}
            {ayahEnd ? `${ayahStart}-${ayahEnd}` : ayahStart}
          </Badge>
        </div>
      )}
    </div>
  )
}
