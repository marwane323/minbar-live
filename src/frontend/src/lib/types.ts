// ===========================
// Auth & User Types
// ===========================

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "imam" | "operator";
  tenant_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ===========================
// Khutba Types
// ===========================

export type KhutbaStatus = "draft" | "ready" | "translating" | "archived";
export type SegmentType = "text" | "quran" | "hadith" | "dua";

export interface Khutba {
  id: string;
  tenant_id: string;
  imam_id: string;
  title: string;
  content: string;
  language: string;
  status: KhutbaStatus;
  segments: Segment[];
  target_languages: string[];
  created_at: string;
  updated_at: string;
}

export interface Segment {
  id: string;
  khutba_id: string;
  index: number;
  text: string;
  language: string;
  type: SegmentType;
  quran_ref?: QuranReference;
  hadith_ref?: HadithReference;
  translations: Record<string, string>;
  tts_urls: Record<string, string>;
  approved: Record<string, boolean>;
}

export interface QuranReference {
  surah: number;
  surah_name: string;
  ayah_start: number;
  ayah_end: number;
}

export interface HadithReference {
  source: string;
  book: string;
  number: string;
}

// ===========================
// Session Types
// ===========================

export type SessionStatus = "preparing" | "live" | "paused" | "ended";

export interface Session {
  id: string;
  tenant_id: string;
  khutba_id: string;
  khutba_title: string;
  title: string;
  status: SessionStatus;
  languages: string[];
  listener_count: number;
  current_segment_index: number;
  started_at?: string;
  ended_at?: string;
  created_at: string;
}

// ===========================
// Voice Profile Types
// ===========================

export type VoiceProfileStatus = "pending" | "processing" | "ready" | "failed";

export interface VoiceProfile {
  id: string;
  imam_id: string;
  status: VoiceProfileStatus;
  consent_given: boolean;
  consent_date?: string;
  sample_duration_seconds?: number;
  created_at: string;
}

// ===========================
// Translation Types
// ===========================

export type TranslationJobStatus = "queued" | "processing" | "completed" | "failed";

export interface TranslationJob {
  id: string;
  khutba_id: string;
  target_language: string;
  status: TranslationJobStatus;
  progress: number;
  segments_completed: number;
  segments_total: number;
  created_at: string;
}

// ===========================
// WebSocket Message Types
// ===========================

export interface WSMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
}

export interface TranscriptPayload {
  segment_index: number;
  text: string;
  confidence: number;
  is_deviation: boolean;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export interface TranslationPayload {
  segment_index: number;
  language: string;
  text: string;
}

export interface AudioPayload {
  segment_index: number;
  language: string;
  audio_url: string;
}

export interface SessionStatusPayload {
  status: SessionStatus;
  listener_count: number;
}

// ===========================
// Mosque / Tenant Types
// ===========================

export type PlanTier = "free" | "starter" | "professional" | "enterprise";

export interface Mosque {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  primary_color?: string;
  accent_color?: string;
  languages: string[];
  plan: PlanTier;
  settings: MosqueSettings;
  created_at: string;
}

export interface MosqueSettings {
  default_asr_model: string;
  default_tts_model: string;
  default_llm_model: string;
  custom_domain?: string;
  enabled_languages: string[];
}

// ===========================
// Stats & Analytics
// ===========================

export interface MosqueStats {
  total_sessions: number;
  total_listeners: number;
  total_khutbas: number;
  active_imams: number;
  languages_used: string[];
  avg_session_duration_minutes: number;
  avg_latency_ms: number;
  sessions_this_month: number;
  listeners_this_month: number;
}

// ===========================
// Glossary
// ===========================

export interface GlossaryEntry {
  id: string;
  tenant_id: string;
  term_arabic: string;
  term_transliteration: string;
  translations: Record<string, string>;
  context?: string;
  created_at: string;
  updated_at: string;
}

// ===========================
// Audit Log
// ===========================

export interface AuditLogEntry {
  id: string;
  tenant_id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

// ===========================
// Language Constants
// ===========================

export const SUPPORTED_LANGUAGES = [
  { code: "ar", name: "العربية", nameEn: "Arabic", dir: "rtl" as const },
  { code: "en", name: "English", nameEn: "English", dir: "ltr" as const },
  { code: "fr", name: "Français", nameEn: "French", dir: "ltr" as const },
  { code: "tr", name: "Türkçe", nameEn: "Turkish", dir: "ltr" as const },
  { code: "ur", name: "اردو", nameEn: "Urdu", dir: "rtl" as const },
  { code: "ms", name: "Bahasa Melayu", nameEn: "Malay", dir: "ltr" as const },
  { code: "id", name: "Bahasa Indonesia", nameEn: "Indonesian", dir: "ltr" as const },
  { code: "bn", name: "বাংলা", nameEn: "Bengali", dir: "ltr" as const },
  { code: "de", name: "Deutsch", nameEn: "German", dir: "ltr" as const },
  { code: "es", name: "Español", nameEn: "Spanish", dir: "ltr" as const },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export function getLanguage(code: string) {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code);
}

export function getLanguageName(code: string): string {
  return getLanguage(code)?.nameEn ?? code;
}
