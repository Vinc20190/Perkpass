'use client';

import { supabase } from '@/lib/supabase/client';

export interface UploadResult {
  url: string;
  path: string;
  error: string | null;
}

/**
 * Upload a file to a Supabase Storage bucket with tenant isolation.
 * Files are stored under {folderId}/{timestamp}-{filename} to enforce
 * per-vendor / per-company folder prefixes that match RLS policies.
 */
export async function uploadFile(
  bucket: string,
  folderId: string,
  file: File,
  options?: { allowedTypes?: string[]; maxSizeMB?: number }
): Promise<UploadResult> {
  const allowedTypes = options?.allowedTypes ?? ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
  const maxSizeMB = options?.maxSizeMB ?? 10;

  if (!allowedTypes.includes(file.type)) {
    return { url: '', path: '', error: `File type ${file.type} is not allowed. Allowed: ${allowedTypes.join(', ')}` };
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return { url: '', path: '', error: `File is too large. Maximum size is ${maxSizeMB}MB.` };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = `${folderId}/${fileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) {
    return { url: '', path: '', error: error.message };
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return { url: urlData.publicUrl, path: filePath, error: null };
}

/**
 * Delete a file from a Supabase Storage bucket by its path.
 */
export async function deleteFile(bucket: string, path: string): Promise<{ error: string | null }> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return { error: error?.message ?? null };
}
