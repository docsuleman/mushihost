/**
 * Coolify sets SUPABASE_URL to a bare IP without a protocol.
 * Resolve it to the internal Kong gateway URL for edge function -> Supabase calls.
 */
export function resolveSupabaseUrl(): string {
  const raw = Deno.env.get('SUPABASE_URL') ?? '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const kongName = Deno.env.get('SERVICE_NAME_SUPABASE_KONG') ?? 'supabase-kong';
  const resourceUuid = Deno.env.get('COOLIFY_RESOURCE_UUID') ?? '';
  const containerName = resourceUuid ? `${kongName}-${resourceUuid}` : kongName;
  return `http://${containerName}:8000`;
}

export function resolvePublicSupabaseUrl(): string {
  const pub = Deno.env.get('SUPABASE_PUBLIC_EXTERNAL_URL') ?? '';
  if (pub.startsWith('http://') || pub.startsWith('https://')) return pub;
  return 'https://db.myqbanks.com';
}
