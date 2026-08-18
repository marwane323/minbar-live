"use client";

import { useState, useCallback } from "react";
import { useApi, useMutation } from "@/lib/hooks";
import { Mosque } from "@/lib/types";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
// Import dropzone - assume it's installed as per prompt "react-dropzone"
import { useDropzone } from "react-dropzone";

export function BrandingEditor() {
  const { data: mosque, isLoading, refetch } = useApi<Mosque>("/api/admin/mosque");
  const { mutate, isLoading: isSaving } = useMutation();
  
  // Local state for live preview
  const [primaryColor, setPrimaryColor] = useState(mosque?.primary_color || "#f59e0b");
  const [accentColor, setAccentColor] = useState(mosque?.accent_color || "#10b981");
  const [customDomain, setCustomDomain] = useState(mosque?.settings.custom_domain || "");
  const [logoPreview, setLogoPreview] = useState<string | null>(mosque?.logo_url || null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      // In a real app we'd upload the file via api.upload here or on save
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  const handleSave = async () => {
    await mutate(() => api.put("/api/admin/mosque", {
      primary_color: primaryColor,
      accent_color: accentColor,
      settings: {
        ...(mosque?.settings || {}),
        custom_domain: customDomain
      }
      // Logo handling would go here
    }));
    refetch();
  };

  if (isLoading) {
    return <div className="text-gray-400">Loading branding settings...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="bg-[#121214] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-100">Logo & Colors</CardTitle>
            <CardDescription className="text-gray-400">Upload your mosque's logo and set your brand colors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="text-gray-200">Mosque Logo</Label>
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-amber-500 bg-amber-500/10" : "border-zinc-700 hover:border-zinc-500 bg-[#09090b]"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <UploadCloud className="w-10 h-10 mb-2 text-zinc-500" />
                  <p className="text-sm font-medium">Drag & drop your logo here</p>
                  <p className="text-xs mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor" className="text-gray-200">Primary Color</Label>
                <div className="flex gap-3 items-center">
                  <input 
                    type="color" 
                    id="primaryColor"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-10 rounded border-0 bg-transparent p-0 cursor-pointer"
                  />
                  <Input 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="bg-[#09090b] border-zinc-800 font-mono text-sm uppercase"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accentColor" className="text-gray-200">Accent Color</Label>
                <div className="flex gap-3 items-center">
                  <input 
                    type="color" 
                    id="accentColor"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-10 w-10 rounded border-0 bg-transparent p-0 cursor-pointer"
                  />
                  <Input 
                    value={accentColor} 
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="bg-[#09090b] border-zinc-800 font-mono text-sm uppercase"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#121214] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-100">Custom Domain</CardTitle>
            <CardDescription className="text-gray-400">Serve the listener portal on your own domain.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="domain" className="text-gray-200">Domain URL</Label>
              <Input 
                id="domain"
                placeholder="live.mymosque.org"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="bg-[#09090b] border-zinc-800 focus-visible:ring-amber-500 text-gray-200" 
              />
              <p className="text-xs text-gray-500 mt-2">
                You will need to set a CNAME record pointing to <code className="text-amber-500">cname.minbar.live</code>.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={isSaving} className="bg-amber-500 text-black hover:bg-amber-400 w-full">
          {isSaving ? "Saving..." : "Save Branding Changes"}
        </Button>
      </div>

      {/* Live Preview */}
      <div>
        <Card className="bg-[#121214] border-zinc-800 h-full">
          <CardHeader>
            <CardTitle className="text-gray-100">Listener App Preview</CardTitle>
            <CardDescription className="text-gray-400">How the portal will look to your congregation.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center pt-8">
            {/* Phone Mockup Container */}
            <div className="w-[320px] h-[600px] bg-black border-8 border-zinc-800 rounded-[2.5rem] overflow-hidden relative shadow-2xl">
              {/* Header */}
              <div 
                className="h-48 flex flex-col items-center justify-center relative"
                style={{ backgroundColor: primaryColor }}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
                
                {logoPreview ? (
                  <img src={logoPreview} alt="Mosque Logo" className="w-20 h-20 object-contain mb-4 relative z-10" />
                ) : (
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 relative z-10">
                    <ImageIcon className="w-8 h-8 text-white/50" />
                  </div>
                )}
                <h3 className="text-white font-bold text-lg relative z-10">{mosque?.name || "Your Mosque"}</h3>
              </div>
              
              {/* Content area */}
              <div className="bg-[#09090b] h-full p-4 space-y-4">
                <div className="h-6 w-1/3 bg-zinc-800 rounded animate-pulse"></div>
                
                <div 
                  className="p-4 rounded-xl border border-zinc-800 flex items-center justify-between"
                  style={{ backgroundColor: `${accentColor}15`, borderColor: `${accentColor}30` }}
                >
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/2 bg-zinc-800 rounded animate-pulse"></div>
                    <div className="h-3 w-3/4 bg-zinc-800 rounded animate-pulse"></div>
                  </div>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    ▶
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <div className="h-3 w-full bg-zinc-800 rounded animate-pulse"></div>
                  <div className="h-3 w-full bg-zinc-800 rounded animate-pulse"></div>
                  <div className="h-3 w-4/5 bg-zinc-800 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
