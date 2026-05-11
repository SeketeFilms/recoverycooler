import { useEffect, useState } from 'react';
import { getSignedAvatarUrl } from '@/lib/avatarUrl';

export function useAvatarUrl(input: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!input) {
      setUrl(null);
      return;
    }
    getSignedAvatarUrl(input).then((u) => {
      if (!cancelled) setUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, [input]);

  return url;
}
