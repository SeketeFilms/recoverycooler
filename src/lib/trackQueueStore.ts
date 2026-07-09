// Persistent play queue shared across Meditation & Cooldown pages.
// Order is preserved and survives navigation via localStorage.

export interface QueuedTrack {
  title: string;
  youtubeId: string;
  duration: string;
  gradient?: string;
  tag?: string;
}

const KEY = 'rc_track_queue_v1';
const HISTORY_KEY = 'rc_track_history_v1';

type Listener = () => void;
const listeners = new Set<Listener>();

const read = (k: string): QueuedTrack[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(k) : null;
    return raw ? (JSON.parse(raw) as QueuedTrack[]) : [];
  } catch {
    return [];
  }
};

const write = (k: string, v: QueuedTrack[]) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* ignore */
  }
};

const emit = () => listeners.forEach((l) => l());

export const trackQueue = {
  get(): QueuedTrack[] {
    return read(KEY);
  },
  history(): QueuedTrack[] {
    return read(HISTORY_KEY);
  },
  set(next: QueuedTrack[]) {
    write(KEY, next);
    emit();
  },
  add(t: QueuedTrack) {
    write(KEY, [...read(KEY), t]);
    emit();
  },
  removeAt(i: number) {
    const q = read(KEY);
    q.splice(i, 1);
    write(KEY, q);
    emit();
  },
  clear() {
    write(KEY, []);
    emit();
  },
  shiftNext(): QueuedTrack | null {
    const q = read(KEY);
    const [next, ...rest] = q;
    write(KEY, rest);
    emit();
    return next ?? null;
  },
  pushHistory(t: QueuedTrack) {
    const h = read(HISTORY_KEY);
    write(HISTORY_KEY, [t, ...h].slice(0, 20));
    emit();
  },
  popHistory(): QueuedTrack | null {
    const h = read(HISTORY_KEY);
    const [prev, ...rest] = h;
    write(HISTORY_KEY, rest);
    emit();
    return prev ?? null;
  },
  subscribe(l: Listener): () => void {
    listeners.add(l);
    // cross-tab sync
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY || e.key === HISTORY_KEY) l();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener('storage', onStorage);
    };
  },
};
