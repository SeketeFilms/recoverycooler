import { useEffect, useState } from 'react';
import { trackQueue, QueuedTrack } from '@/lib/trackQueueStore';

export function useTrackQueue() {
  const [queue, setQueue] = useState<QueuedTrack[]>(() => trackQueue.get());
  const [history, setHistory] = useState<QueuedTrack[]>(() => trackQueue.history());

  useEffect(() => {
    const sync = () => {
      setQueue(trackQueue.get());
      setHistory(trackQueue.history());
    };
    return trackQueue.subscribe(sync);
  }, []);

  return { queue, history, api: trackQueue };
}
