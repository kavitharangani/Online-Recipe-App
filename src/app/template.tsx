"use client";

import { motion } from "motion/react";

/**
 * Re-mounts on every navigation, giving each page a soft fade-in.
 * Opacity only: a transform here would break `position: fixed` children such as cook mode.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
