import os
import time
from abc import ABC, abstractmethod
import httpx
from .schemas import TranslationRequest, TranslationResponse

SYSTEM_PROMPT = "You are a professional Islamic sermon translator. Translate the following Arabic Khutba text. Preserve Islamic terminology using their widely accepted transliterations. For Quranic verses, use established scholarly translations. Maintain the reverential tone appropriate for religious discourse."

class TranslationProvider(ABC):
    @abstractmethod
    async def translate(self, request: TranslationRequest) -> TranslationResponse:
        pass

class OllamaProvider(TranslationProvider):
    def __init__(self, base_url: str = None, model: str = "aya-expanse:32b"):
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = model

    async def translate(self, request: TranslationRequest) -> TranslationResponse:
        start_time = time.time()
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": request.text,
                        "system": SYSTEM_PROMPT,
                        "stream": False
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()["response"]
                
        except Exception as e:
            result = f"[Simulation - Ollama] Translated: {request.text}"
            
        processing_time_ms = (time.time() - start_time) * 1000
        
        return TranslationResponse(
            original_text=request.text,
            translated_text=result,
            source_language=request.source_language,
            target_language=request.target_language,
            model_used=f"ollama/{self.model}",
            is_official_translation=False,
            processing_time_ms=processing_time_ms,
            confidence=0.9
        )

class OpenAIProvider(TranslationProvider):
    def __init__(self, api_key: str = None, model: str = "gpt-4o"):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model = model

    async def translate(self, request: TranslationRequest) -> TranslationResponse:
        start_time = time.time()
        
        if not self.api_key:
            result = f"[Simulation - OpenAI] Translated: {request.text}"
        else:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {self.api_key}"},
                        json={
                            "model": self.model,
                            "messages": [
                                {"role": "system", "content": SYSTEM_PROMPT},
                                {"role": "user", "content": request.text}
                            ]
                        },
                        timeout=30.0
                    )
                    response.raise_for_status()
                    result = response.json()["choices"][0]["message"]["content"]
            except Exception as e:
                result = f"[Simulation - OpenAI] Translated: {request.text}"

        processing_time_ms = (time.time() - start_time) * 1000
        
        return TranslationResponse(
            original_text=request.text,
            translated_text=result,
            source_language=request.source_language,
            target_language=request.target_language,
            model_used=f"openai/{self.model}",
            is_official_translation=False,
            processing_time_ms=processing_time_ms,
            confidence=0.9
        )

class CohereProvider(TranslationProvider):
    def __init__(self, api_key: str = None, model: str = "command-r-plus"):
        self.api_key = api_key or os.getenv("COHERE_API_KEY")
        self.model = model

    async def translate(self, request: TranslationRequest) -> TranslationResponse:
        start_time = time.time()
        
        if not self.api_key:
            result = f"[Simulation - Cohere] Translated: {request.text}"
        else:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        "https://api.cohere.ai/v1/chat",
                        headers={"Authorization": f"Bearer {self.api_key}"},
                        json={
                            "model": self.model,
                            "message": request.text,
                            "preamble": SYSTEM_PROMPT
                        },
                        timeout=30.0
                    )
                    response.raise_for_status()
                    result = response.json()["text"]
            except Exception as e:
                result = f"[Simulation - Cohere] Translated: {request.text}"

        processing_time_ms = (time.time() - start_time) * 1000
        
        return TranslationResponse(
            original_text=request.text,
            translated_text=result,
            source_language=request.source_language,
            target_language=request.target_language,
            model_used=f"cohere/{self.model}",
            is_official_translation=False,
            processing_time_ms=processing_time_ms,
            confidence=0.9
        )
