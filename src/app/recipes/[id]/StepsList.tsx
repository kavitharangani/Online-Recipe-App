"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion";
import type { Step } from "@/lib/types";
import { StepTimer } from "@/components/StepTimer";

export function StepsList({ steps }: { steps: Step[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());

  function toggle(id: number) {
    setDone((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Stagger as="ol" interval={0.12} className="mt-6 space-y-4 [perspective:1200px]">
      {steps.map((step, index) => {
        const finished = done.has(step.id);
        return (
          <StaggerItem as="li" kind="swing" key={step.id} className={`card flex gap-4 p-5 transition-opacity ${finished ? "opacity-60" : ""}`}>
            <motion.button
              whileTap={{ scale: 0.8 }}
              type="button"
              onClick={() => toggle(step.id)}
              className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold transition ${
                finished ? "bg-emerald-500 text-white" : "bg-brand-100 text-brand-700 hover:bg-brand-200 dark:bg-brand-500/15 dark:text-brand-300"
              }`}
              aria-label={finished ? `Mark step ${index + 1} as not done` : `Mark step ${index + 1} as done`}
              aria-pressed={finished}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={finished ? "done" : "todo"}
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {finished ? <Check className="size-4" strokeWidth={3} /> : index + 1}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            <div className="flex-1">
              <p className={`leading-relaxed ${finished ? "line-through" : ""}`}>{step.instruction}</p>
              {step.timer_minutes && <StepTimer minutes={step.timer_minutes} className="no-print mt-3" />}
            </div>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
