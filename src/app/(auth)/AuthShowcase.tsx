"use client";

import { motion, stagger } from "motion/react";

const EMOJIS = ["🍛", "🥞", "🍝", "🥗", "🍰", "🍲", "🥐", "🥤"];

/** Decorative panel beside the login/register forms. */
export function AuthShowcase() {
  return (
    <motion.div
      className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-400 via-brand-500 to-rose-500 p-12 text-white shadow-2xl"
      initial={{ opacity: 0, x: -80, rotate: -2 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 16 }}
    >
      <motion.div
        className="grid grid-cols-4 gap-4 text-5xl"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { delayChildren: stagger(0.08, { startDelay: 0.3, from: "center" }) } } }}
      >
        {EMOJIS.map((emoji, index) => (
          <motion.span
            key={emoji}
            className="grid aspect-square place-items-center rounded-2xl bg-white/15 backdrop-blur"
            variants={{
              hidden: { opacity: 0, scale: 0, rotate: -180 },
              show: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 200, damping: 14 } },
            }}
            whileHover={{ scale: 1.15, rotate: 8, backgroundColor: "rgba(255,255,255,0.3)" }}
          >
            {/* Each tile bobs on its own rhythm so the wall feels alive. */}
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2 + (index % 3) * 0.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
            >
              {emoji}
            </motion.span>
          </motion.span>
        ))}
      </motion.div>
      <motion.h2
        className="mt-10 font-display text-3xl font-semibold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        Every great meal starts with a recipe.
      </motion.h2>
      <motion.p className="mt-3 text-white/85" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
        Save favourites, plan your week, build shopping lists and share your kitchen secrets with cooks everywhere.
      </motion.p>
    </motion.div>
  );
}
