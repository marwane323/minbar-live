import { ReactNode } from "react";
import { Headphones } from "lucide-react";
import Link from "next/link";

export default function ListenLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090b] text-gray-100 flex flex-col font-sans selection:bg-amber-500/30">
      <header className="h-14 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 shrink-0">
        <Link href="/listen" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Headphones className="w-4 h-4 text-amber-500" />
          </div>
          <span className="font-bold tracking-tight text-lg">Minbar Live</span>
        </Link>
      </header>
      <main className="flex-1 flex flex-col w-full max-w-3xl mx-auto relative">
        {children}
      </main>
    </div>
  );
}
