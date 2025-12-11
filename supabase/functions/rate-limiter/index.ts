import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'auth': { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  'default': { maxRequests: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
};

function getRateLimitKey(ip: string, endpoint: string): string {
  return `${ip}:${endpoint}`;
}

function isRateLimited(key: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return false;
  }

  if (record.count >= config.maxRequests) {
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
    const { endpoint, action } = await req.json();
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';

    // Determine rate limit config based on endpoint
    const rateLimitType = endpoint?.includes('auth') ? 'auth' : 'default';
    const config = RATE_LIMITS[rateLimitType];
    const key = getRateLimitKey(clientIP, endpoint || 'unknown');

    const limited = isRateLimited(key, config);

    if (limited) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}, endpoint: ${endpoint}`);
      
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
          rateLimited: true 
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Log security events
    if (action === 'failed_login') {
      console.warn(`Failed login attempt from IP: ${clientIP}`);
    }

    return new Response(
      JSON.stringify({ allowed: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Rate limiter error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});