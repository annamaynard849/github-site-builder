import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { preplanCaseId } = await req.json();

    if (!preplanCaseId) {
      throw new Error('preplanCaseId is required');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Authentication failed');
    }

    // Get the preplan case
    const { data: preplanCase, error: caseError } = await supabase
      .from('cases')
      .select('*, loved_ones(*)')
      .eq('id', preplanCaseId)
      .eq('user_id', user.id)
      .eq('type', 'PREPLAN')
      .single();

    if (caseError || !preplanCase) {
      throw new Error('Preplan case not found or access denied');
    }

    // Create the new LOSS case
    const { data: newCase, error: createError } = await supabase
      .from('cases')
      .insert({
        user_id: user.id,
        loved_one_id: preplanCase.loved_one_id,
        type: 'LOSS',
        status: 'active',
        preplan_case_id: preplanCaseId,
      })
      .select()
      .single();

    if (createError || !newCase) {
      throw new Error('Failed to create LOSS case');
    }

    // Fetch plan and onboarding answers for context
    const { data: plan } = await supabase
      .from('plans')
      .select('plan_json')
      .eq('case_id', preplanCaseId)
      .maybeSingle();

    const { data: onboardingAnswers } = await supabase
      .from('onboarding_answers')
      .select('answers_json')
      .eq('case_id', preplanCaseId)
      .maybeSingle();

    // Combine answers for task generation
    const combinedAnswers = {
      ...(onboardingAnswers?.answers_json || {}),
      ...(plan?.plan_json || {}),
    };

    // Generate tasks using the plan.ts logic (imported as module)
    // For now, we'll create a basic set of tasks
    const postLossTasks = [
      {
        loved_one_id: newCase.loved_one_id,
        case_id: newCase.id,
        title: 'Order certified copies of the death certificate',
        category: 'Legal & Financial',
        status: 'pending',
        is_personalized: true,
        created_by_user_id: user.id,
      },
      {
        loved_one_id: newCase.loved_one_id,
        case_id: newCase.id,
        title: 'Notify financial institutions and freeze accounts',
        category: 'Legal & Financial',
        status: 'pending',
        is_personalized: true,
        created_by_user_id: user.id,
      },
      {
        loved_one_id: newCase.loved_one_id,
        case_id: newCase.id,
        title: 'Contact funeral home or crematory',
        category: 'Memorial Planning (only if holding a service)',
        status: 'pending',
        is_personalized: true,
        created_by_user_id: user.id,
      },
    ];

    // Insert tasks
    const { error: tasksError } = await supabase
      .from('tasks')
      .insert(postLossTasks);

    if (tasksError) {
      console.error('Error creating tasks:', tasksError);
    }

    // Duplicate support team invitations for the new case
    const { data: invitations } = await supabase
      .from('support_team_invitations')
      .select('*')
      .eq('case_id', preplanCaseId);

    if (invitations && invitations.length > 0) {
      const newInvitations = invitations.map(inv => ({
        loved_one_id: newCase.loved_one_id,
        case_id: newCase.id,
        invited_email: inv.invited_email,
        invited_first_name: inv.invited_first_name,
        invited_last_name: inv.invited_last_name,
        relationship_to_loved_one: inv.relationship_to_loved_one,
        role: inv.role,
        invited_by_user_id: user.id,
        status: 'pending',
      }));

      await supabase
        .from('support_team_invitations')
        .insert(newInvitations);
    }

    // Create memorial page for the new case
    const slug = `${preplanCase.loved_ones.first_name.toLowerCase()}-${preplanCase.loved_ones.last_name.toLowerCase()}`.replace(/[^a-z0-9-]/g, '');
    
    const { data: memorialPage } = await supabase
      .from('memorial_pages')
      .insert({
        loved_one_id: newCase.loved_one_id,
        case_id: newCase.id,
        slug: `${slug}-${Date.now()}`,
        title: `${preplanCase.loved_ones.first_name} ${preplanCase.loved_ones.last_name}`,
        is_public: false,
      })
      .select()
      .single();

    // Mark preplan tasks as read-only by updating their status
    await supabase
      .from('tasks')
      .update({ status: 'archived' })
      .eq('case_id', preplanCaseId);

    // Log analytics event
    console.log('Case migrated:', {
      from: preplanCaseId,
      to: newCase.id,
      loved_one_id: newCase.loved_one_id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        newCaseId: newCase.id,
        tasksCreated: postLossTasks.length,
        invitationsDuplicated: invitations?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
