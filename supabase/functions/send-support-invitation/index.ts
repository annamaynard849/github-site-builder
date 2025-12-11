import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SupportInvitationRequest {
  invitation_id: string;
  invited_email: string;
  invited_name: string;
  loved_one_name: string;
  loved_one_id: string;
  inviter_name: string;
  relationship?: string;
  personal_message?: string;
  invitation_token: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("send-support-invitation function called");

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing Authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing authentication' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    // Verify the user's authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid authentication token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('Authenticated user:', user.id);
    
    const requestBody = await req.text();
    const {
      invitation_id,
      invited_email,
      invited_name,
      loved_one_name,
      loved_one_id,
      inviter_name,
      relationship,
      personal_message,
      invitation_token
    }: SupportInvitationRequest = JSON.parse(requestBody);

    // Authorization check: Verify the user owns the loved_one being invited to
    const { data: lovedOne, error: ownershipError } = await supabaseClient
      .from('loved_ones')
      .select('admin_user_id')
      .eq('id', loved_one_id)
      .single();

    if (ownershipError || !lovedOne) {
      console.error('Loved one not found:', ownershipError);
      return new Response(JSON.stringify({ error: 'Loved one not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (lovedOne.admin_user_id !== user.id) {
      console.error('User does not own this loved one');
      return new Response(JSON.stringify({ error: 'Forbidden: You do not have permission to send invitations for this loved one' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log("Parsed invitation data:", {
      invitation_id,
      invited_email,
      invited_name,
      loved_one_name,
      inviter_name,
      relationship
    });

    // Check if Resend API key is available
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    console.log("Resend API key exists:", !!resendApiKey);
    console.log("Resend API key length:", resendApiKey?.length || 0);

    // Get the site URL from the request headers
    const origin = req.headers.get("origin") || "https://your-app.lovable.app";
    const acceptUrl = `${origin}/accept-invitation?token=${invitation_token}`;

    const relationshipText = relationship ? ` as ${relationship.replace('_', ' ')}` : '';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        
        <h1 style="color: #333; text-align: center; margin-bottom: 30px; font-size: 24px;">
          <span style="color: hsl(210, 60%, 65%);">💙</span> Support Team Invitation
        </h1>
        
        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          Hello ${invited_name},
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          <strong>${inviter_name}</strong> has invited you to join the support team for <strong>${loved_one_name}</strong>${relationshipText} using Honorly.
        </p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">About Honorly</h3>
          <p style="margin: 0; color: #555; line-height: 1.6;">
            Grief is overwhelming. The logistics shouldn't be. From memorials to paperwork, finances, and emotional support — we help you navigate everything that comes next, one clear step at a time.
          </p>
        </div>
        
        ${personal_message ? `
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #6366f1; margin: 20px 0;">
            <p style="margin: 0; font-style: italic; color: #555;">
              "${personal_message}"
            </p>
          </div>
        ` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${acceptUrl}" 
             style="background-color: #6366f1; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; font-weight: 500;
                    display: inline-block;">
            Accept Invitation
          </a>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
          <h3 style="color: #333; margin-bottom: 15px;">What you'll be able to do with Honorly:</h3>
          <ul style="color: #555; line-height: 1.6;">
            <li>View and manage tasks related to ${loved_one_name}'s care</li>
            <li>Access important information and documents in one secure place</li>
            <li>Coordinate with other support team members seamlessly</li>
            <li>Receive updates about important developments</li>
            <li>Help reduce the coordination burden on primary caregivers</li>
          </ul>
        </div>
        
        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #888; font-size: 14px; margin: 0;">© 2025 Honorly. All rights reserved.</p>
        </div>
        
        <p style="font-size: 14px; color: #888; margin-top: 30px; text-align: center;">
          This invitation will expire in 7 days. If you can't click the button above, 
          copy and paste this link into your browser:<br>
          <span style="word-break: break-all;">${acceptUrl}</span>
        </p>
        
        <p style="font-size: 14px; color: #888; text-align: center; margin-top: 20px;">
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
    `;

    console.log("Sending email with Resend...");
    const emailResponse = await resend.emails.send({
      from: "Honorly Support Team <onboarding@resend.dev>",
      to: [invited_email],
      subject: `Honorly - ${loved_one_name} Support Team Invite`,
      html: htmlContent,
    });

    console.log("Support invitation sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-support-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);