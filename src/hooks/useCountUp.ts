import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  duration?: number;
  decimals?: number;
  enabled?: boolean;
}

export const useCountUp = (
  targetValue: number,
  options: UseCountUpOptions = {}
) => {
  const { duration = 1500, decimals = 2, enabled = true } = options;
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startValueRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setCount(targetValue);
      return;
    }

    // Resetar quando o valor alvo mudar
    startValueRef.current = count;
    startTimeRef.current = null;

    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValueRef.current + (targetValue - startValueRef.current) * easeOut;

      setCount(currentValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(targetValue);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [targetValue, duration, enabled]);

  return parseFloat(count.toFixed(decimals));
};
