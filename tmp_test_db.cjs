const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

async function test_db() {
  const { data: students, error: err1 } = await supabase.from('students').select('*');
  const { data: votes, error: err2 } = await supabase.from('votes').select('*');
  const { data: profiles, error: err3 } = await supabase.from('profiles').select('*');
  
  console.log('Students:', err1 || students.slice(0, 3));
  console.log('Votes count:', err2 || votes.length);
  console.log('Profiles:', err3 || profiles.slice(0, 3));
}

test_db();
