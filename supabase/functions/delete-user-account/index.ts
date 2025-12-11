import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      throw new Error('No authorization header');
    }

    // Create client with user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is authenticated using the bearer token directly
    const token = authHeader.replace('Bearer ', '').trim();
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError) {
      console.error('Auth error:', userError);
      throw new Error(`Authentication failed: ${userError.message}`);
    }
    
    if (!user) {
      console.error('No user found in token');
      throw new Error('User not authenticated - invalid or expired session');
    }

    console.log(`Starting account deletion for user: ${user.id}`);

    // Create admin client with service role
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

    // Step 1: Delete all loved ones they admin (this should cascade to related data)
    console.log('Deleting loved ones...');
    const { error: lovedOnesError } = await supabaseAdmin
      .from('loved_ones')
      .delete()
      .eq('admin_user_id', user.id);

    if (lovedOnesError) {
      console.error('Error deleting loved ones:', lovedOnesError);
      throw new Error(`Failed to delete loved ones: ${lovedOnesError.message}`);
    }

    // Step 2: Delete loved one access records
    console.log('Deleting loved one access...');
    const { error: accessError } = await supabaseAdmin
      .from('loved_one_access')
      .delete()
      .eq('user_id', user.id);

    if (accessError) {
      console.error('Error deleting access records:', accessError);
      throw new Error(`Failed to delete access records: ${accessError.message}`);
    }

    // Step 3: Delete onboarding answers
    console.log('Deleting onboarding answers...');
    const { error: onboardingError } = await supabaseAdmin
      .from('onboarding_answers')
      .delete()
      .eq('user_id', user.id);

    if (onboardingError) {
      console.error('Error deleting onboarding answers:', onboardingError);
      // Don't throw - continue with deletion
    }

    // Step 4: Delete grief support answers
    console.log('Deleting grief support answers...');
    const { error: griefError } = await supabaseAdmin
      .from('grief_support_answers')
      .delete()
      .eq('user_id', user.id);

    if (griefError) {
      console.error('Error deleting grief support answers:', griefError);
      // Don't throw - continue with deletion
    }

    // Step 5: Delete profile
    console.log('Deleting profile...');
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('user_id', user.id);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      throw new Error(`Failed to delete profile: ${profileError.message}`);
    }

    // Step 6: Delete the auth user account (THIS IS THE KEY STEP THAT WAS MISSING)
    console.log('Deleting auth user account...');
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      throw new Error(`Failed to delete auth account: ${authDeleteError.message}`);
    }

    console.log(`Successfully deleted account for user: ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account deleted successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in delete-user-account function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
