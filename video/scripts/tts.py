"""Generate the Part 1 voiceover with Piper (offline, no API keys).

Reads src/part1/narration.json, synthesizes one WAV per segment, joins each
scene's segments with short pauses, and writes:

  public/part1/audio/<scene>.mp3   one narration track per scene
  src/part1/timings.json           segment start/end times, in seconds

Usage (from video/):
  python3 -m venv .venv && .venv/bin/pip install piper-tts
  # voice: https://huggingface.co/rhasspy/piper-voices (en_US/lessac/medium)
  .venv/bin/python scripts/tts.py --model path/to/en_US-lessac-medium.onnx
"""

import argparse
import json
import re
import subprocess
import tempfile
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NARRATION = ROOT / "src/part1/narration.json"
TIMINGS = ROOT / "src/part1/timings.json"
AUDIO_DIR = ROOT / "public/part1/audio"

GAP = 0.35  # seconds of silence between segments
LEAD = 0.2  # seconds of silence before the first segment

# Spoken forms for terms the voice reads badly. Applied in order, whole words.
SAY = [
    (r"\bL1d\b", "L1 D"),
    (r"\bL1i\b", "L1 I"),
    (r"\bSRAM\b", "S-RAM"),
    (r"\bDRAM\b", "D-RAM"),
    (r"\bDDR(\d)\b", r"D D R \1"),
    (r"\bLRU\b", "L R U"),
    (r"\bTLBs\b", "T L Bs"),
    (r"\bx86\b", "x 86"),
    (r"\bgcc\b", "G C C"),
    (r"\bARM\b", "arm"),
    (r"2\.933", "2 point 9 3 3"),
    (r"\bmohit d dot com\b", "mohit D dot com"),
]


def spoken(text: str) -> str:
    for pattern, repl in SAY:
        text = re.sub(pattern, repl, text)
    return text


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True)
    parser.add_argument("--piper", default="piper", help="piper executable")
    parser.add_argument("--length-scale", type=float, default=1.0)
    args = parser.parse_args()

    narration = json.loads(NARRATION.read_text())
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    timings: dict = {"voice": Path(args.model).stem, "gap": GAP, "scenes": {}}

    with tempfile.TemporaryDirectory() as tmp:
        tmpdir = Path(tmp)
        for scene in narration["scenes"]:
            frames = b""
            rate = None
            cursor = LEAD
            segments = []
            for seg in scene["segments"]:
                wav_path = tmpdir / f"{scene['id']}-{seg['id']}.wav"
                cmd = [args.piper, "-m", args.model, "-f", str(wav_path),
                       "--length-scale", str(args.length_scale)]
                subprocess.run(cmd, input=spoken(seg["text"]).encode(),
                               check=True, capture_output=True)
                with wave.open(str(wav_path)) as w:
                    if rate is None:
                        rate = w.getframerate()
                        frames += b"\0\0" * int(LEAD * rate)
                    data = w.readframes(w.getnframes())
                duration = len(data) / 2 / rate
                segments.append({"id": seg["id"], "start": round(cursor, 3),
                                 "end": round(cursor + duration, 3)})
                frames += data + b"\0\0" * int(GAP * rate)
                cursor += duration + GAP

            scene_wav = tmpdir / f"{scene['id']}.wav"
            with wave.open(str(scene_wav), "wb") as w:
                w.setnchannels(1)
                w.setsampwidth(2)
                w.setframerate(rate)
                w.writeframes(frames)
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", str(scene_wav),
                 "-codec:a", "libmp3lame", "-b:a", "64k", "-ac", "1",
                 str(AUDIO_DIR / f"{scene['id']}.mp3")],
                check=True,
            )
            timings["scenes"][scene["id"]] = {
                "duration": round(len(frames) / 2 / rate, 3),
                "segments": segments,
            }
            print(f"{scene['id']:>10}  {timings['scenes'][scene['id']]['duration']:6.1f} s")

    TIMINGS.write_text(json.dumps(timings, indent=2) + "\n")
    total = sum(s["duration"] for s in timings["scenes"].values())
    print(f"total narration {total / 60:.1f} min")


if __name__ == "__main__":
    main()
