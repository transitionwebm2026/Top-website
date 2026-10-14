/**
 * Runs `fn` once the browser is idle (at the latest after `timeout` ms), so
 * background work never competes with showing the page. Returns a cancel function.
 * Safari has no requestIdleCallback: it gets a short delay instead.
 */
export function whenIdle(fn, timeout = 2000) {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(fn, { timeout });
    return () => cancelIdleCallback(id);
  }
  const id = setTimeout(fn, 300);
  return () => clearTimeout(id);
}

/** The visitor turned on their browser's or phone's data saver. */
export const savesData = () => typeof navigator !== 'undefined' && Boolean(navigator.connection?.saveData);
