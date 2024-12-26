import { createClient } from '@supabase/supabase-js';
import {
  SUPABASE_URL,
  SUPABASE_PUBLIC_API_KEY,
} from '../constants.mjs';

// uses the public api key
export function SupabaseStorage({
  jwt,
}) {
  const o = {
    auth: {
      persistSession: false, // All our access is from server, so no need to persist the session to browser's local storage
    },
  };
  if (jwt) {
    o.global = {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    };
 } 
  return createClient(SUPABASE_URL, SUPABASE_PUBLIC_API_KEY, o);
};