import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

const KEY = "tidal-ambient";

/**
 * Gentle generated ambience: a slow ~60bpm swell of soft sine tones,
 * synthesised in the browser so there is nothing to download and nothing loud.
 */
export function AmbientAudio({ className }: { className?: string }) {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setOn(window.localStorage.getItem(KEY) === "on");
  }, []);

  useEffect(() => {
    if (!on) {
      stopRef.current?.();
      stopRef.current = null;
      return;
    }

    const AudioCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;

    const ctx = ctxRef.current ?? new AudioCtor();
    ctxRef.current = ctx;
    void ctx.resume();

    const master = ctx.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 4);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 720;
    filter.connect(master);
    master.connect(ctx.destination);

    // Soft, consonant drone — no sudden changes, no vocals.
    const voices = [110, 164.81, 220, 329.63].map((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      gain.gain.value = 0.22 / (i + 1);

      // one slow swell per second → a resting-heartbeat pulse
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.011;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.12 / (i + 1);
      lfo.connect(lfoGain).connect(gain.gain);

      osc.connect(gain).connect(filter);
      osc.start();
      lfo.start();
      return () => {
        osc.stop();
        lfo.stop();
      };
    });

    stopRef.current = () => {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
      window.setTimeout(() => voices.forEach((stop) => stop()), 1400);
    };

    return () => stopRef.current?.();
  }, [on]);

  function toggle() {
    const next = !on;
    setOn(next);
    window.localStorage.setItem(KEY, next ? "on" : "off");
  }

  return (
    <button
      onClick={toggle}
      aria-pressed={on}
      title={on ? "Turn calm sound off" : "Play calm sound"}
      className={cn(
        "flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs transition-colors",
        on ? "bg-primary/12 text-primary" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {on ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{on ? "Calm sound on" : "Calm sound"}</span>
    </button>
  );
}
