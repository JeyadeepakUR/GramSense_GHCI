"""
Setup script for Whisper Tiny ONNX model.
Run once to download the model files.
"""

from pathlib import Path
import requests
from tqdm import tqdm


def download_file(url: str, destination: Path) -> None:
    """Download file with progress bar."""
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    total_size = int(response.headers.get('content-length', 0))
    
    destination.parent.mkdir(parents=True, exist_ok=True)
    
    with open(destination, 'wb') as f, tqdm(
        desc=destination.name,
        total=total_size,
        unit='B',
        unit_scale=True,
        unit_divisor=1024,
    ) as bar:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
            bar.update(len(chunk))


def setup_models():
    """Download Whisper Tiny ONNX models."""
    
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    
    print("Setting up Whisper Tiny ONNX models...")
    print("=" * 60)
    
    # Download encoder
    encoder_path = models_dir / "encoder.onnx"
    if not encoder_path.exists():
        print("\nDownloading encoder model...")
        encoder_url = "https://huggingface.co/onnx-community/whisper-tiny/resolve/main/encoder_model.onnx"
        try:
            download_file(encoder_url, encoder_path)
            print(f"✓ Encoder downloaded: {encoder_path.stat().st_size / 1024 / 1024:.1f} MB")
        except Exception as e:
            print(f"✗ Encoder download failed: {e}")
    else:
        print(f"✓ Encoder already exists: {encoder_path.stat().st_size / 1024 / 1024:.1f} MB")
    
    # Download decoder
    decoder_path = models_dir / "decoder.onnx"
    if not decoder_path.exists():
        print("\nDownloading decoder model...")
        decoder_url = "https://huggingface.co/onnx-community/whisper-tiny/resolve/main/decoder_model.onnx"
        try:
            download_file(decoder_url, decoder_path)
            print(f"✓ Decoder downloaded: {decoder_path.stat().st_size / 1024 / 1024:.1f} MB")
        except Exception as e:
            print(f"✗ Decoder download failed: {e}")
    else:
        print(f"✓ Decoder already exists: {decoder_path.stat().st_size / 1024 / 1024:.1f} MB")
    
    print("\n" + "=" * 60)
    print("✓ Setup complete!")
    print("\nUsage:")
    print("  from core import WhisperASR")
    print("  asr = WhisperASR('models/encoder.onnx')")
    print("  asr.load()")
    print("  result = asr.transcribe(audio_array)")


if __name__ == "__main__":
    setup_models()
