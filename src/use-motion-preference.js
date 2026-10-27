import {useSyncExternalStore} from 'react';

const query = '(prefers-reduced-motion: reduce)';
const subscribe = notify => {
  const media = window.matchMedia(query);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};
const snapshot = () => window.matchMedia(query).matches;
const serverSnapshot = () => false;

// Framer Motion 14's built-in hook snapshots the initial value. Subscribe to
// the media query so changing the OS setting also stops an in-progress reveal.
export function useMotionPreference() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
