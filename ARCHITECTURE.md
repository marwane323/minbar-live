# 🏗️ Minbar Live — System Architecture

## 1. High-Level Architecture

```
                        ┌─────────────────────────────────────┐
                        │         Minbar Live Platform         │
                        │                                     │
  ┌──────────┐          │  ┌──────────┐    ┌──────────────┐  │
  │  Imam    │──Mic────▶│  │  ASR     │───▶│  Alignment   │  │
  │  Portal  │          │  │  Engine  │    │  Engine      │  │
  └──────────┘          │  └──────────┘    └──────┬───────┘  │
                        │                         │           │
  ┌──────────┐          │  ┌──────────────────────▼────────┐  │
  │  Admin   │◀────────▶│  │     LLM Translation Service   │  │
  │  Portal  │          │  │  (Ollama / OpenAI / Cohere)   │  │
  └──────────┘          │  └──────────────────┬────────────┘  │
                        │                     │               │
                        │  ┌──────────────────▼────────────┐  │
                        │  │    WebSocket Broadcast Layer   │  │
                        │  │     (FastAPI + Redis PubSub)   │  │
                        │  └────────────────────────────────┘  │
                        │         │              │             │
                        └─────────┼──────────────┼─────────────┘
                                  │              │
                    ┌─────────────▼──┐    ┌──────▼──────────┐
                    │  Listener PWA   │    │  OBS Caption     │
                    │  (QR / URL)     │    │  WebSocket URL   │
                    └─────────────────┘    └──────────────────┘
```

## 2. Service Breakdown

### 2.1 Core Services

| Service | Tech | Port | Responsibility |
|---|---|---|---|
| `api-gateway` | FastAPI + Nginx | 80/443 | Auth, routing, rate limiting |
| `asr-service` | Python + faster-whisper / Cohere ASR | 8001 | Real-time speech transcription |
| `alignment-service` | Python + rapidfuzz | 8002 | Match live speech to pre-loaded script |
| `translation-service` | Python + LangChain + Ollama/OpenAI | 8003 | LLM-based translation |
| `tts-service` | Python + Chatterbox Multilingual | 8004 | Voice cloning and audio generation |
| `quran-service` | Python + quran.json + fuzzy match | 8005 | Verse/Hadith detection and lookup |
| `websocket-hub` | FastAPI WebSockets + Redis | 8006 | Real-time broadcast to listeners |
| `session-manager` | FastAPI + PostgreSQL | 8007 | Session lifecycle, history, export |
| `frontend` | Next.js 14 | 3000 | All portal UIs (SSR) |
| `worker` | Celery + Redis | — | Async tasks: TTS pre-gen, video captions |

### 2.2 Data Stores

| Store | Tech | Use |
|---|---|---|
| Primary DB | PostgreSQL 16 | All persistent data, multi-tenant with RLS |
| Cache / PubSub | Redis 7 | Session state, WebSocket pub/sub, task queue |
| Object Storage | MinIO (dev) / S3 (prod) | Audio files, voice profiles, video uploads, exports |
| Search | PostgreSQL full-text (initial) / Meilisearch (v2) | Session history search |
| Vector DB | pgvector extension | Quran/Hadith semantic search |

## 3. Database Schema (Key Tables)

```sql
-- Multi-tenancy anchor
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(63) UNIQUE NOT NULL,  -- used in subdomain: slug.minbarlive.com
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'free',
    branding JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row-level security on all tenant-scoped tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON sessions
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- Sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    imam_id UUID REFERENCES users(id),
    title VARCHAR(500),
    source_language VARCHAR(10) DEFAULT 'ar',
    target_languages TEXT[] DEFAULT ARRAY['en'],
    status VARCHAR(20) DEFAULT 'preparing',  -- preparing|live|ended
    khutba_script_id UUID REFERENCES khutba_scripts(id),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    listener_count_peak INT DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'
);

-- Khutba pre-loaded script
CREATE TABLE khutba_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    imam_id UUID REFERENCES users(id),
    title VARCHAR(500),
    topic_hint TEXT,
    raw_text TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'ar',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Script segments (paragraphs/sentences)
CREATE TABLE khutba_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id UUID REFERENCES khutba_scripts(id) ON DELETE CASCADE,
    sequence_number INT NOT NULL,
    text TEXT NOT NULL,
    segment_type VARCHAR(20) DEFAULT 'speech',  -- speech|quran|hadith|dua
    quran_reference VARCHAR(20),  -- e.g. '2:255'
    hadith_reference VARCHAR(100),
    UNIQUE(script_id, sequence_number)
);

-- Pre-generated translations per segment
CREATE TABLE segment_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_id UUID REFERENCES khutba_segments(id) ON DELETE CASCADE,
    language VARCHAR(10) NOT NULL,
    translation TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    audio_s3_key VARCHAR(500),  -- pre-generated TTS audio
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(segment_id, language)
);

-- Imam voice profiles
CREATE TABLE voice_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    imam_id UUID REFERENCES users(id),
    sample_s3_key VARCHAR(500),  -- encrypted
    profile_s3_key VARCHAR(500),  -- Chatterbox voice embedding, encrypted
    created_at TIMESTAMPTZ DEFAULT NOW(),
    consent_given_at TIMESTAMPTZ,
    consent_ip VARCHAR(45)
);
```

## 4. WebSocket Protocol

```
# Client → Server
{"type": "JOIN", "session_id": "uuid", "language": "fr", "mode": "read|listen"}
{"type": "PING"}

# Server → Client  
{"type": "SEGMENT", "seq": 42, "text": "...", "lang": "fr", "ts": 1234567890}
{"type": "AUDIO_CHUNK", "seq": 42, "data": "<base64>", "lang": "fr"}
{"type": "QURAN_VERSE", "seq": 43, "surah": 2, "ayah": 255, "arabic": "...", "translation": "..."}
{"type": "SESSION_END", "summary_url": "https://..."}
{"type": "PONG"}
{"type": "ERROR", "code": "LANG_NOT_SUPPORTED", "message": "..."}
```

## 5. Latency Budget

| Stage | Target | Notes |
|---|---|---|
| Audio capture → ASR first token | <400ms | GPU inference |
| ASR segment complete | <800ms | ~5 word chunks |
| Alignment match | <50ms | In-memory fuzzy match |
| Translation (pre-scripted) | 0ms | Already computed |
| Translation (live deviation) | <1500ms | LLM API call |
| WebSocket delivery | <100ms | Redis pub/sub |
| **Total (scripted path)** | **<950ms** | GPU |
| **Total (deviation path)** | **<2400ms** | GPU + LLM |

## 6. Multi-Tenancy Architecture

- Subdomain routing: `{slug}.minbarlive.com` → Nginx routes to same app cluster with `X-Tenant-ID` header
- Database: single schema, all tables have `tenant_id` column with RLS policies
- Redis: all keys namespaced `{tenant_id}:*`
- S3: bucket per tenant OR prefix per tenant with bucket-level access policy
- Feature flags: tenant-level config in `tenants.branding` JSONB

## 7. Scalability Design

- **ASR service:** Stateless, horizontally scalable; GPU node pool in K8s with GPU requests
- **WebSocket hub:** Sticky sessions via Nginx `ip_hash`; Redis pub/sub decouples hub instances
- **Translation service:** Rate-limited by LLM provider; local Ollama deployment avoids API costs at scale
- **TTS service:** Pre-generated audio cached in S3; only live deviations require real-time generation
- **Database:** PgBouncer connection pooling; read replicas for analytics queries
