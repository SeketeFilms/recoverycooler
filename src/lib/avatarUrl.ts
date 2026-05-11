import { supabase } from '@/integrations/supabase/client';

// In-memory cache: path -> { url, expiresAt }
const cache = new Map<string, { url: string; expiresAt: number }>();
const TTL_SECONDS = 3600; // 1 hour
const REFRESH_BEFORE_MS = 5 * 60 * 1000; // refresh 5 min before expiry

/**
 * Extract storage path from either a full Supabase URL or a raw path.
 * Storage path format: `<user_id>/avatar.<ext>`
 */
export function extractAvatarPath(input: string | null | undefined): string | null {
  if (!input) return null;
  if (!input.includes('://')) return input; // already a path
  // .../object/public/avatars/<path> or .../object/sign/avatars/<path>?token=...
  const m = input.match(/\/avatars\/([^?]+)/);
  return m ? m[1] : null;
}

export async function getSignedAvatarUrl(input: string | null | undefined): Promise<string | null> {
  const path = extractAvatarPath(input);
  if (!path) return null;

  const cached = cache.get(path);
  if (cached && cached.expiresAt - Date.now() > REFRESH_BEFORE_MS) {
    return cached.url;
  }

  const { data, error } = await supabase.storage
    .from('avatars')
    .createSignedUrl(path, TTL_SECONDS);

  if (error || !data?.signedUrl) {
    console.warn('Failed to sign avatar URL', error);
    return null;
  }

  cache.set(path, {
    url: data.signedUrl,
    expiresAt: Date.now() + TTL_SECONDS * 1000,
  });
  return data.signedUrl;
}

export function invalidateAvatarCache(input?: string | null) {
  if (!input) {
    cache.clear();
    return;
  }
  const path = extractAvatarPath(input);
  if (path) cache.delete(path);
}
