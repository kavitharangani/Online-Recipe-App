"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";

function format(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Countdown timer for a recipe step; beeps and vibrates when it reaches zero. */
export function StepTimer({ minutes, className = "", large = false }: { minutes: number; className?: string; large?: boolean }) {
  const total = minutes * 60;
  const [remaining, setRemaining] = useState(total);
  const [running, setRunning] = useState(false);
  const endsAt = useRef(0);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const left = Math.max(0, Math.round((endsAt.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setRunning(false);
        alarm();
      }
    };
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [running]);

  function start() {
    const from = remaining === 0 ? total : remaining;
    endsAt.current = Date.now() + from * 1000;
    setRemaining(from);
    setRunning(true);
  }

  const finished = remaining === 0;
  const progress = 1 - remaining / total;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 ${
        finished
          ? "animate-pulse border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800"
      } ${large ? "gap-4 px-5 py-3 text-2xl" : "text-sm"} ${className}`}
    >
      <Timer className={large ? "size-7" : "size-4"} />
      <span className="font-mono font-semibold tabular-nums" aria-live="polite">
        {finished ? "Done!" : format(remaining)}
      </span>
      <div className={`h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700 ${large ? "w-32" : "w-16"}`}>
        <div className="h-full bg-brand-500 transition-[width]" style={{ width: `${progress * 100}%` }} />
      </div>
      {running ? (
        <button type="button" onClick={() => setRunning(false)} aria-label="Pause timer" className="rounded-lg p-1 hover:bg-stone-200 dark:hover:bg-stone-700">
          <Pause className={large ? "size-6" : "size-4"} />
        </button>
      ) : (
        <button type="button" onClick={start} aria-label="Start timer" className="rounded-lg p-1 hover:bg-stone-200 dark:hover:bg-stone-700">
          <Play className={large ? "size-6" : "size-4"} />
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          setRunning(false);
          setRemaining(total);
        }}
        aria-label="Reset timer"
        className="rounded-lg p-1 hover:bg-stone-200 dark:hover:bg-stone-700"
      >
        <RotateCcw className={large ? "size-6" : "size-4"} />
      </button>
    </div>
  );
}

function alarm() {
  try {
    navigator.vibrate?.([300, 150, 300]);
    const context = new AudioContext();
    [0, 0.35, 0.7].forEach((offset) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.2, context.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + offset + 0.3);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(context.currentTime + offset);
      oscillator.stop(context.currentTime + offset + 0.3);
    });
  } catch {
    // Audio may be blocked; the visual "Done!" state still shows.
  }
}
