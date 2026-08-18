import io
import numpy as np
from scipy.io import wavfile

def generate_sine_wave(duration_ms: int, frequency: float = 440.0, sample_rate: int = 24000) -> bytes:
    duration_s = duration_ms / 1000.0
    t = np.linspace(0, duration_s, int(sample_rate * duration_s), endpoint=False)
    audio = np.sin(2 * np.pi * frequency * t) * 32767
    audio = audio.astype(np.int16)
    
    buf = io.BytesIO()
    wavfile.write(buf, sample_rate, audio)
    return buf.getvalue()

def generate_silence(duration_ms: int, sample_rate: int = 24000) -> bytes:
    duration_s = duration_ms / 1000.0
    audio = np.zeros(int(sample_rate * duration_s), dtype=np.int16)
    
    buf = io.BytesIO()
    wavfile.write(buf, sample_rate, audio)
    return buf.getvalue()

def estimate_speech_duration(text: str, language: str) -> float:
    # Rough estimate based on char count: ~15 chars per second on average
    chars_per_second = 15.0
    if language == 'ar':
        chars_per_second = 12.0 # Adjust for Arabic if needed
    
    seconds = len(text) / chars_per_second
    return seconds * 1000.0 # Return ms

def convert_format(audio_bytes: bytes, from_format: str, to_format: str) -> bytes:
    if from_format == to_format:
        return audio_bytes
    # Mock conversion
    return audio_bytes
