import { JoinFlow } from "@/components/listen/join-flow";

export default function ListenPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Join a Session</h1>
          <p className="text-gray-400">
            Enter the session ID or Mosque Code to listen to live translations.
          </p>
        </div>
        <JoinFlow />
      </div>
    </div>
  );
}
