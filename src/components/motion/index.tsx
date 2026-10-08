"use client";

import {
  animate,
  motion,
  MotionConfig,
  stagger,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { useEffect, useRef } from "react";

/** Honour the visitor's "reduce motion" OS setting everywhere. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

// ---------------------------------------------------------------------------
// Reveal: one element animating in when scrolled into view, in several styles.
// ---------------------------------------------------------------------------

const REVEALS = {
  "fade-up": { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } },
  "fade-left": { hidden: { opacity: 0, x: -60 }, show: { opacity: 1, x: 0 } },
  "fade-right": { hidden: { opacity: 0, x: 60 }, show: { opacity: 1, x: 0 } },
  zoom: { hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1 } },
  blur: { hidden: { opacity: 0, filter: "blur(12px)", y: 12 }, show: { opacity: 1, filter: "blur(0px)", y: 0 } },
  flip: { hidden: { opacity: 0, rotateX: -70, y: 30 }, show: { opacity: 1, rotateX: 0, y: 0 } },
  /** Curtain-style wipe from left to right. */
  wipe: { hidden: { clipPath: "inset(0 100% 0 0 round 1.5rem)" }, show: { clipPath: "inset(0 0% 0 0 round 1.5rem)" } },
} satisfies Record<string, Variants>;

export type RevealKind = keyof typeof REVEALS;

export function Reveal({
  kind = "fade-up",
  delay = 0,
  className,
  children,
}: {
  kind?: RevealKind;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={className}
      variants={REVEALS[kind]}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      style={kind === "flip" ? { transformPerspective: 900 } : undefined}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Stagger: a container whose children enter one after another.
// ---------------------------------------------------------------------------

const ITEMS = {
  /** Springy scale-up, good for small tiles. */
  pop: {
    hidden: { opacity: 0, scale: 0.5, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 18 } },
  },
  /** Cards rising and un-tilting like dealt playing cards. */
  cascade: {
    hidden: { opacity: 0, y: 60, rotate: -3 },
    show: { opacity: 1, y: 0, rotate: 0, transition: { type: "spring", stiffness: 120, damping: 16 } },
  },
  /** List rows sliding in from the left. */
  slide: {
    hidden: { opacity: 0, x: -24 },
    show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  },
  /** Swings in from the right on a vertical hinge, like turning a page. */
  swing: {
    hidden: { opacity: 0, x: 50, rotateY: -35 },
    show: { opacity: 1, x: 0, rotateY: 0, transition: { type: "spring", stiffness: 140, damping: 18 } },
  },
  /** Gentle fade for dense content. */
  fade: {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  },
} satisfies Record<string, Variants>;

export type StaggerKind = keyof typeof ITEMS;

export function Stagger({
  as = "div",
  interval = 0.08,
  delay = 0,
  inView = true,
  className,
  children,
}: {
  as?: "div" | "ul" | "ol";
  interval?: number;
  delay?: number;
  /** Start when scrolled into view (default) or immediately on mount. */
  inView?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const Component = motion[as];
  const variants: Variants = { hidden: {}, show: { transition: { delayChildren: stagger(interval, { startDelay: delay }) } } };
  return (
    <Component
      className={className}
      variants={variants}
      initial="hidden"
      {...(inView ? { whileInView: "show", viewport: { once: true, margin: "-40px" } } : { animate: "show" })}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  as = "div",
  kind = "fade",
  className,
  hoverLift = false,
  children,
}: {
  as?: "div" | "li";
  kind?: StaggerKind;
  className?: string;
  hoverLift?: boolean;
  children: React.ReactNode;
}) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      variants={ITEMS[kind]}
      whileHover={hoverLift ? { y: -6, transition: { type: "spring", stiffness: 300, damping: 20 } } : undefined}
    >
      {children}
    </Component>
  );
}

// ---------------------------------------------------------------------------
// TextReveal: words slide up out of a mask, one by one.
// ---------------------------------------------------------------------------

export function TextReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { delayChildren: stagger(0.07, { startDelay: delay }) } } }}
      aria-label={text}
    >
      {text.split(" ").map((word, index) => (
        <span key={index} className="inline-block overflow-hidden pb-[0.12em] align-bottom" aria-hidden>
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "110%", rotate: 6 },
              show: { y: "0%", rotate: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

// ---------------------------------------------------------------------------
// TiltCard: follows the pointer in 3D with a soft spring.
// ---------------------------------------------------------------------------

export function TiltCard({ className, children }: { className?: string; children: React.ReactNode }) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(y, [0, 1], [12, -12]), { stiffness: 150, damping: 15 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-12, 12]), { stiffness: 150, damping: 15 });
  const glareX = useTransform(x, [0, 1], ["0%", "100%"]);
  const glare = useTransform(glareX, (gx) => `radial-gradient(circle at ${gx} 30%, rgba(255,255,255,0.35), transparent 55%)`);

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.3 }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - rect.left) / rect.width);
        y.set((event.clientY - rect.top) / rect.height);
      }}
      onPointerLeave={() => {
        x.set(0.5);
        y.set(0.5);
      }}
    >
      {children}
      <motion.div className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]" style={{ background: glare }} />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// FloatingEmojis: food drifting lazily in the background.
// ---------------------------------------------------------------------------

const FLOATERS = [
  { emoji: "🌶️", left: "6%", top: "18%", size: "text-3xl", duration: 7, delay: 0 },
  { emoji: "🥥", left: "44%", top: "8%", size: "text-4xl", duration: 9, delay: 1.2 },
  { emoji: "🍋", left: "88%", top: "14%", size: "text-3xl", duration: 8, delay: 0.6 },
  { emoji: "🧄", left: "3%", top: "78%", size: "text-2xl", duration: 10, delay: 2 },
  { emoji: "🌿", left: "52%", top: "86%", size: "text-3xl", duration: 7.5, delay: 0.3 },
  { emoji: "🍅", left: "93%", top: "72%", size: "text-2xl", duration: 8.5, delay: 1.6 },
];

export function FloatingEmojis() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {FLOATERS.map((f) => (
        <motion.span
          key={f.emoji}
          className={`absolute ${f.size} opacity-60 select-none`}
          style={{ left: f.left, top: f.top }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.6, scale: 1, y: [0, -22, 0], x: [0, 10, 0], rotate: [0, 14, -10, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: f.delay },
            scale: { type: "spring", delay: f.delay },
            y: { duration: f.duration, repeat: Infinity, ease: "easeInOut", delay: f.delay },
            x: { duration: f.duration * 1.3, repeat: Infinity, ease: "easeInOut", delay: f.delay },
            rotate: { duration: f.duration * 1.6, repeat: Infinity, ease: "easeInOut", delay: f.delay },
          }}
        >
          {f.emoji}
        </motion.span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CountUp: numbers that tick up when they scroll into view.
// ---------------------------------------------------------------------------

export function CountUp({ value, decimals = 0, prefix = "", className }: { value: number; decimals?: number; prefix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    const node = ref.current;
    if (!inView || !node) return;
    const controls = animate(0, value, {
      duration: Math.min(1.8, 0.6 + value / 400),
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        node.textContent = prefix + latest.toLocaleString("en", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      },
    });
    return () => controls.stop();
  }, [inView, value, decimals, prefix]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {(0).toFixed(decimals)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// GrowBar: a progress bar that fills when it scrolls into view.
// ---------------------------------------------------------------------------

export function GrowBar({ percent, className, delay = 0 }: { percent: number; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ width: 0 }}
      whileInView={{ width: `${percent}%` }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

// ---------------------------------------------------------------------------
// ScrollProgress: thin bar at the top tracking how far the page is read.
// ---------------------------------------------------------------------------

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25, restDelta: 0.001 });
  return (
    <motion.div
      className="no-print fixed inset-x-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-brand-400 via-brand-500 to-rose-500"
      style={{ scaleX }}
    />
  );
}

// ---------------------------------------------------------------------------
// Magnetic: an element that leans toward the pointer.
// ---------------------------------------------------------------------------

export function Magnetic({ children, strength = 0.35, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const x = useSpring(0, { stiffness: 200, damping: 12 });
  const y = useSpring(0, { stiffness: 200, damping: 12 });
  return (
    <motion.div
      className={`inline-block ${className ?? ""}`}
      style={{ x, y }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - rect.left - rect.width / 2) * strength);
        y.set((event.clientY - rect.top - rect.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileTap={{ scale: 0.94 }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// SlideDown: flash messages dropping in with a bounce.
// ---------------------------------------------------------------------------

export function SlideDown({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: -30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}
