import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_ANON_KEY as string
);

const bucket = process.env.SUPABASE_BUCKET as string

export default supabase.storage.from(bucket)