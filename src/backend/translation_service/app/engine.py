import asyncio
import time
from .schemas import TranslationConfig, TranslationRequest, TranslationResponse, BatchTranslationRequest, BatchTranslationResponse
from .providers import TranslationProvider, OllamaProvider, OpenAIProvider, CohereProvider
from .glossary import GlossaryManager
from .quran_translations import QuranTranslationHandler

class TranslationEngine:
    def __init__(self, config: TranslationConfig):
        self.config = config
        self.provider = self._initialize_provider(config)
        self.glossary_manager = GlossaryManager()
        self.quran_handler = QuranTranslationHandler()

    def _initialize_provider(self, config: TranslationConfig) -> TranslationProvider:
        if config.model_provider == "openai":
            return OpenAIProvider(model=config.model_name)
        elif config.model_provider == "cohere":
            return CohereProvider(model=config.model_name)
        else:
            return OllamaProvider(model=config.model_name)

    async def translate(self, request: TranslationRequest) -> TranslationResponse:
        start_time = time.time()
        
        if request.segment_type == "quran" and request.quran_reference:
            try:
                surah, ayah = map(int, request.quran_reference.split(":"))
                official_trans = self.quran_handler.get_official_translation(surah, ayah, request.target_language)
                if official_trans:
                    processing_time_ms = (time.time() - start_time) * 1000
                    return TranslationResponse(
                        original_text=request.text,
                        translated_text=official_trans,
                        source_language=request.source_language,
                        target_language=request.target_language,
                        model_used="official_quran_translation",
                        is_official_translation=True,
                        processing_time_ms=processing_time_ms,
                        confidence=1.0
                    )
            except ValueError:
                pass
                
        response = await self.provider.translate(request)
        
        if self.config.use_glossary:
            response.translated_text = self.glossary_manager.apply_glossary(
                response.translated_text, 
                request.target_language
            )
            
        return response

    async def translate_batch(self, batch: BatchTranslationRequest) -> BatchTranslationResponse:
        start_time = time.time()
        
        tasks = [self.translate(req) for req in batch.segments]
        translations = await asyncio.gather(*tasks)
        
        total_time_ms = (time.time() - start_time) * 1000
        
        return BatchTranslationResponse(
            translations=translations,
            total_time_ms=total_time_ms
        )
