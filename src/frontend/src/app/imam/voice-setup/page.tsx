"use client";

import { PageShell } from "@/components/layout/page-shell";
import { VoiceProfileSetup } from "@/components/imam/voice-profile-setup";
import { useApi, useMutation } from "@/lib/hooks";
import { api } from "@/lib/api";
import { VoiceProfile } from "@/lib/types";

export default function VoiceSetupPage() {
  const { data: profile, refetch } = useApi<VoiceProfile>('/api/voice-profiles');
  const { mutate } = useMutation();

  const handleUpload = async (blob: Blob) => {
    const formData = new FormData();
    formData.append("audio", blob, "voice_sample.webm");
    await mutate(() => api.upload('/api/voice-profiles/upload', formData));
    refetch();
  };

  return (
    <PageShell 
      title="Voice Profile Setup"
      description="Record a sample of your voice to generate an AI voice clone for live translations."
    >
      {profile?.status === "processing" ? (
        <div className="p-8 bg-[#121214] border border-zinc-800 rounded-lg text-center">
          <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-lg font-medium text-gray-100">Processing Voice Profile</h3>
          <p className="text-zinc-400 mt-2">We are currently building your custom voice model. This may take up to 24 hours.</p>
        </div>
      ) : profile?.status === "ready" ? (
        <div className="p-8 bg-[#121214] border border-emerald-500/50 rounded-lg text-center">
          <h3 className="text-lg font-medium text-emerald-500">Voice Profile Ready</h3>
          <p className="text-zinc-400 mt-2">Your voice profile is active and ready to be used in live sessions.</p>
        </div>
      ) : (
        <VoiceProfileSetup onUpload={handleUpload} />
      )}
    </PageShell>
  );
}
