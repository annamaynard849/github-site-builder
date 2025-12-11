import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(ip: string): string {
  return `passcode:${ip}`;
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const key = getRateLimitKey(ip);
  const record = rateLimitStore.get(key);
  const maxAttempts = 5;
  const windowMs = 15 * 60 * 1000; // 15 minutes

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return false;
  }

  if (record.count >= maxAttempts) {
    return true;
  }

  record.count++;
  return false;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { passcode } = await req.json();
    
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';

    // Check rate limit
    if (isRateLimited(clientIP)) {
      console.warn(`Rate limit exceeded for passcode validation from IP: ${clientIP}`);
      
      return new Response(
        JSON.stringify({ 
          error: 'Too many attempts. Please try again later.',
          valid: false 
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the valid passcode from environment variable
    const validPasscode = Deno.env.get('PILOT_PASSCODE') || '565broome';

    // Validate passcode
    const isValid = passcode === validPasscode;

    // Create Supabase client for logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log the attempt
    await supabase.from('security_logs').insert({
      event_type: isValid ? 'passcode_validated' : 'passcode_failed',
      user_id: null,
      details: {
        ip_address: clientIP,
        user_agent: req.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
        success: isValid
      }
    });

    if (!isValid) {
      console.warn(`Failed passcode attempt from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid passcode',
          valid: false 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate a simple access token (could be JWT in production)
    const accessToken = crypto.randomUUID();

    return new Response(
      JSON.stringify({ 
        valid: true,
        accessToken
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Passcode validation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', valid: false }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
