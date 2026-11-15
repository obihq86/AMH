import os
import math
import wave
import struct

# সরাসরি আপনার Vite অ্যাপের public/sounds ফোল্ডারে সেভ হবে
OUTPUT_DIR = os.path.join("public", "sounds")
os.makedirs(OUTPUT_DIR, exist_ok=True)
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "chime.wav")

SAMPLE_RATE = 44100

def generate_note(freq, duration, volume=0.5):
    samples = []
    num_samples = int(SAMPLE_RATE * duration)
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # স্মুথ ফেইড-ইন এবং বেলের মতো রিংগিং ফেইড-আউট
        attack = min(1.0, t / 0.015)
        decay = math.exp(-3.5 * t)
        envelope = attack * decay

        # মূল নোট + হারমোনিক টোন (মিষ্টি বেল সাউন্ডের জন্য)
        wave_val = (
            0.75 * math.sin(2 * math.pi * freq * t) +
            0.20 * math.sin(2 * math.pi * (freq * 2) * t) +
            0.05 * math.sin(2 * math.pi * (freq * 3) * t)
        )
        sample = int(32767 * volume * envelope * wave_val)
        samples.append(max(-32768, min(32767, sample)))
    return samples

# ডিং (E5 = 659.25 Hz) এবং ডং (C5 = 523.25 Hz) নোট তৈরি
ding = generate_note(659.25, 0.45, volume=0.6)
dong = generate_note(523.25, 0.85, volume=0.6)

all_samples = ding + dong

with wave.open(OUTPUT_FILE, "w") as wav_file:
    wav_file.setnchannels(1)      # Mono
    wav_file.setsampwidth(2)      # 16-bit
    wav_file.setframerate(SAMPLE_RATE)
    wav_file.writeframes(struct.pack(f"<{len(all_samples)}h", *all_samples))

print(f"সফলভাবে ডিং-ডং চাইম তৈরি হয়েছে: {OUTPUT_FILE}")