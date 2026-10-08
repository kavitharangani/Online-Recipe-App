"use client";

import { useEffect } from "react";
import { useAnimate } from "motion/react";

/** Shakes the referenced element side to side whenever `trigger` changes to a truthy value. */
export function useShake<T extends Element>(trigger: unknown) {
  const [scope, animate] = useAnimate<T>();
  useEffect(() => {
    if (trigger && scope.current) {
      animate(scope.current, { x: [0, -12, 12, -8, 8, -4, 0] }, { duration: 0.45 });
    }
  }, [trigger, animate, scope]);
  return scope;
}
