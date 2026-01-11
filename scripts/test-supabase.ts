/**
 * Test Supabase Connection
 * Run with: npx ts-node scripts/test-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.log('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('\n🔌 Testing Supabase Connection...\n');
  console.log('URL:', supabaseUrl);
  console.log('');

  try {
    // Test 1: Check if we can reach Supabase
    console.log('1. Testing API reachability...');
    const { error: healthError } = await supabase
      .from('facilities')
      .select('count')
      .limit(1);

    if (healthError) {
      // This error is expected if table doesn't exist yet
      if (healthError.message.includes('does not exist')) {
        console.log('   ⚠️  Tables not created yet - run the migration SQL first');
      } else {
        console.log('   ❌ Error:', healthError.message);
      }
    } else {
      console.log('   ✅ Connection successful!');
    }

    // Test 2: Check auth service
    console.log('\n2. Testing Auth service...');
    const { data: session, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.log('   ❌ Auth error:', authError.message);
    } else {
      console.log('   ✅ Auth service available');
      console.log('   Session:', session.session ? 'Active' : 'No active session');
    }

    console.log('\n✅ Supabase connection test complete!\n');
    console.log('Next steps:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Run the migration file: supabase/migrations/001_initial_schema.sql');
    console.log('3. Generate TypeScript types: npx supabase gen types typescript --project-id zxrnfcckzjrnbrfymlnz > src/shared/types/database.ts\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

testConnection();
