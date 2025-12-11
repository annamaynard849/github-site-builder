import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WaitlistConfirmationRequest {
  email: string;
  firstName: string;
  lastName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("send-waitlist-confirmation function called");
  console.log("Request method:", req.method);

  try {
    const { email, firstName, lastName }: WaitlistConfirmationRequest = await req.json();

    console.log("Sending waitlist confirmation to:", email);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        
        <h1 style="color: #333; text-align: center; margin-bottom: 30px; font-size: 24px;">
          <span style="color: hsl(210, 60%, 65%);">💙</span> Welcome to the Honorly Waitlist
        </h1>
        
        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          Hello ${firstName},
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          Thank you for joining the Honorly waitlist! We're excited to have you as part of our early community.
        </p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">What's Next?</h3>
          <p style="margin: 0; color: #555; line-height: 1.6;">
            We're working hard to bring Honorly to life. You'll be among the first to know when we launch, and we'll send you an exclusive invitation to try the platform.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">About Honorly</h3>
          <p style="margin: 0; color: #555; line-height: 1.6;">
            Grief is overwhelming. The logistics shouldn't be. From memorials to paperwork, finances, and emotional support — we help you navigate everything that comes next, one clear step at a time.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #555; font-size: 16px; margin: 0;">
            We'll be in touch soon with your exclusive early access invitation.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #888; font-size: 14px; margin: 0;">© 2025 Honorly. All rights reserved.</p>
        </div>
        
        <p style="font-size: 14px; color: #888; text-align: center; margin-top: 20px;">
          If you didn't sign up for our waitlist, you can safely ignore this email.
        </p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Honorly Team <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to the Honorly Waitlist!",
      html: htmlContent,
    });

    console.log("Waitlist confirmation sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-waitlist-confirmation function:", error);
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