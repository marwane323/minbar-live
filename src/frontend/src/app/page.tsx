import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between flex-col text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">🕌 Minbar Live</h1>
        <p className="text-2xl text-gray-300 mb-8 font-light">Every word of the Khutba, in every language</p>
        <div className="mb-12">
          <span className="inline-flex items-center rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-400 ring-1 ring-inset ring-emerald-400/20">
            System Online
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
          <Link href="/imam" className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-gray-800 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <h2 className="mb-3 text-2xl font-semibold">Imam <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span></h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">Portal for the Imam to broadcast audio.</p>
          </Link>
          <Link href="/session" className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-gray-800 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <h2 className="mb-3 text-2xl font-semibold">Operator <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span></h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">Manage the live session and translations.</p>
          </Link>
          <Link href="/listen" className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-gray-800 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <h2 className="mb-3 text-2xl font-semibold">Listen <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span></h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">Connect to the stream and hear translations.</p>
          </Link>
          <Link href="/admin" className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-gray-800 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <h2 className="mb-3 text-2xl font-semibold">Admin <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span></h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">System configuration and monitoring.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
