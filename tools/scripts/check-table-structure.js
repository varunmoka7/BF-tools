require('dotenv').config({ quiet: true });
const { createClient } = require('@supabase/supabase-js');

async function checkTableStructure() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  console.log('🔍 Checking existing table structures...\n');
  
  // Try different approaches to get table info
  console.log('1. Attempting to describe companies table...');
  
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'companies' });
  
  if (error) {
    console.log('RPC failed:', error.message);
    
    // Try direct table access with minimal fields
    console.log('\n2. Testing minimal insert...');
    const testResult = await supabase
      .from('companies')
      .insert({ name: 'test' })
      .select();
      
    if (testResult.error) {
      console.log('Minimal insert error:', testResult.error.message);
      
      // Try even simpler
      console.log('\n3. Testing empty insert...');
      const emptyResult = await supabase
        .from('companies')
        .insert({})
        .select();
        
      if (emptyResult.error) {
        console.log('Empty insert error:', emptyResult.error.message);
      }
    }
  } else {
    console.log('Table columns:', data);
  }
  
  // Check if we can at least read from it
  console.log('\n4. Testing read access...');
  const readResult = await supabase
    .from('companies')
    .select()
    .limit(1);
    
  if (readResult.error) {
    console.log('Read error:', readResult.error.message);
  } else {
    console.log('Read successful, data:', readResult.data);
  }
}

checkTableStructure().catch(console.error);