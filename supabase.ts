
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uusvorligoaffxbjxskr.supabase.co';
const supabaseKey = 'sb_publishable_l2haXZ3AN_U7ohXYLPTwGA_vU8VSV5T';

export const supabase = createClient(supabaseUrl, supabaseKey);
