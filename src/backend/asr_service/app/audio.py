import numpy as np
import io
import soundfile as sf
import scipy.signal

def preprocess_audio(raw_bytes: bytes, target_sample_rate: int = 16000) -> bytes:
    """
    Normalizes and resamples audio.
    Assumes raw_bytes is a valid audio format (e.g. WAV).
    """
    try:
        data, samplerate = sf.read(io.BytesIO(raw_bytes))
    except Exception:
        # If it's raw PCM or cannot be parsed, return as is for now
        # In a real scenario, we'd handle more robust conversion
        return raw_bytes

    # Convert to mono if stereo
    if len(data.shape) > 1:
        data = data.mean(axis=1)

    # Resample if needed
    if samplerate != target_sample_rate:
        num_samples = int(len(data) * target_sample_rate / samplerate)
        data = scipy.signal.resample(data, num_samples)

    # Normalize
    max_val = np.max(np.abs(data))
    if max_val > 0:
        data = data / max_val

    # Write back to WAV format bytes
    out_io = io.BytesIO()
    sf.write(out_io, data, target_sample_rate, format='WAV', subtype='PCM_16')
    return out_io.getvalue()

def detect_silence(audio_chunk: bytes, threshold: float = 0.01) -> bool:
    """
    Voice activity detection using RMS energy.
    Assumes raw_bytes is 16-bit PCM.
    """
    if not audio_chunk:
        return True
        
    try:
        # Simplistic approach for raw 16-bit PCM
        audio_array = np.frombuffer(audio_chunk, dtype=np.int16)
        if len(audio_array) == 0:
            return True
        rms = np.sqrt(np.mean(np.square(audio_array.astype(np.float32))))
        max_rms = 32768.0  # Max for 16-bit
        normalized_rms = rms / max_rms
        return normalized_rms < threshold
    except Exception:
        return False

def chunk_audio(audio_stream: bytes, chunk_duration_ms: int = 500, sample_rate: int = 16000) -> list[bytes]:
    """
    Splits an audio stream into chunks of chunk_duration_ms.
    Assumes raw 16-bit PCM audio stream for chunking calculation.
    """
    bytes_per_ms = int(sample_rate * 2 / 1000)  # 2 bytes per sample for 16-bit PCM
    chunk_size = bytes_per_ms * chunk_duration_ms
    
    chunks = []
    for i in range(0, len(audio_stream), chunk_size):
        chunks.append(audio_stream[i:i+chunk_size])
        
    return chunks
