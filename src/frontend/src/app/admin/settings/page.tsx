"use client";

import { PageShell } from "@/components/layout/page-shell";
import { GlossaryEditor } from "@/components/admin/glossary-editor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SUPPORTED_LANGUAGES } from "@/lib/types";

export default function AdminSettingsPage() {
  return (
    <PageShell 
      title="Mosque Settings" 
      description="Configure languages, AI models, and custom terminology."
    >
      <div className="space-y-6">
        
        {/* Language Configuration */}
        <Card className="bg-[#121214] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-100">Language Configuration</CardTitle>
            <CardDescription className="text-gray-400">Enable or disable translation languages for your listeners.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <div key={lang.code} className="flex items-center justify-between p-3 border border-zinc-800 rounded-md bg-[#1a1a1e]">
                <Label htmlFor={`lang-${lang.code}`} className="text-gray-200 cursor-pointer">
                  {lang.nameEn} ({lang.name})
                </Label>
                <Switch id={`lang-${lang.code}`} defaultChecked={['en', 'fr', 'ar'].includes(lang.code)} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Model Selection */}
        <Card className="bg-[#121214] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-100">AI Model Selection</CardTitle>
            <CardDescription className="text-gray-400">Choose the underlying models used for transcription and translation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-xl">
            <div className="space-y-2">
              <Label className="text-gray-200">Speech-to-Text (ASR)</Label>
              <Select defaultValue="whisper-v3">
                <SelectTrigger className="bg-[#09090b] border-zinc-800 text-gray-200 focus:ring-amber-500">
                  <SelectValue placeholder="Select ASR model" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1e] border-zinc-700 text-gray-200">
                  <SelectItem value="whisper-v3">Whisper V3 (Accurate)</SelectItem>
                  <SelectItem value="deepgram">Deepgram Nova-2 (Fast)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-200">Translation (LLM)</Label>
              <Select defaultValue="gpt-4o">
                <SelectTrigger className="bg-[#09090b] border-zinc-800 text-gray-200 focus:ring-amber-500">
                  <SelectValue placeholder="Select Translation model" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1e] border-zinc-700 text-gray-200">
                  <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                  <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet (Anthropic)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-200">Text-to-Speech (TTS)</Label>
              <Select defaultValue="elevenlabs">
                <SelectTrigger className="bg-[#09090b] border-zinc-800 text-gray-200 focus:ring-amber-500">
                  <SelectValue placeholder="Select TTS model" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1e] border-zinc-700 text-gray-200">
                  <SelectItem value="elevenlabs">ElevenLabs Multilingual v2</SelectItem>
                  <SelectItem value="openai">OpenAI TTS-1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card className="bg-[#121214] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-100">API Key Management</CardTitle>
            <CardDescription className="text-gray-400">Manage integration keys if using BYOK (Bring Your Own Key).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-xl">
            <div className="space-y-2">
              <Label className="text-gray-200">OpenAI API Key</Label>
              <Input type="password" placeholder="sk-..." className="bg-[#09090b] border-zinc-800 focus-visible:ring-amber-500 text-gray-200" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-200">ElevenLabs API Key</Label>
              <Input type="password" placeholder="..." className="bg-[#09090b] border-zinc-800 focus-visible:ring-amber-500 text-gray-200" />
            </div>
            <Button className="bg-amber-500 text-black hover:bg-amber-400 mt-2">Save Keys</Button>
          </CardContent>
        </Card>

        {/* Custom Glossary */}
        <Card className="bg-[#121214] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-100">Custom Glossary</CardTitle>
            <CardDescription className="text-gray-400">Ensure consistent translation of Islamic terminology.</CardDescription>
          </CardHeader>
          <CardContent>
            <GlossaryEditor />
          </CardContent>
        </Card>

      </div>
    </PageShell>
  );
}
