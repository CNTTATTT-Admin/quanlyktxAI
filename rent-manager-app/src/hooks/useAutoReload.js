import { useEffect } from "react";

const DEFAULT_INTERVAL_MS = 15000;

export default function useAutoReload({
  enabled,
  onReload,
  intervalMs = DEFAULT_INTERVAL_MS,
  eventName = "app-data-updated",
}) {
  useEffect(() => {
    if (!enabled) return;

    const handleReload = () => {
      onReload();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        onReload();
      }
    };

    const intervalId = window.setInterval(onReload, intervalMs);

    window.addEventListener(eventName, handleReload);
    window.addEventListener("focus", handleReload);
    window.addEventListener("storage", handleReload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(eventName, handleReload);
      window.removeEventListener("focus", handleReload);
      window.removeEventListener("storage", handleReload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, eventName, intervalMs, onReload]);
}
