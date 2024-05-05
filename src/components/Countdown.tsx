import { useEffect, useState } from "react";

export function Countdown({ onEnd }: { onEnd: () => void }) {
  const [count, setCount] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev > 0) return prev - 1;

        return 5;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [onEnd]);

  useEffect(() => {
    if (count === 0) onEnd();
  }, [count, onEnd]);

  return <div>{count}</div>;
}
